<?php

namespace App\Services;

use App\Jobs\SendNotificationEmailJob;
use App\Jobs\SendPushNotificationJob;
use App\Models\Event;
use App\Models\EventNotificationDelivery;
use App\Models\Notification;
use App\Models\User;

class NotificationDispatchService
{
    protected const EMAIL_AND_PUSH = [
        'registration_success',
        'event_reminder',
        'event_updated',
        'event_cancelled',
        'certificate_available',
    ];

    protected const PUSH_ONLY = [
        'host_new_registration',
        'host_registration_cancelled',
        'attendance_checked_in',
        'event_capacity_warning',
        'bookmarked_event_reminder',
    ];

    public function dispatch(
        User $recipient,
        string $category,
        string $title,
        string $body,
        string $target,
        ?Event $event = null,
        ?string $reminderOffset = null,
        bool $respectEnabled = true,
    ): void {
        if ($event && $reminderOffset) {
            $exists = EventNotificationDelivery::where('event_id', $event->id)
                ->where('user_id', $recipient->id)
                ->where('category', $category)
                ->where('reminder_offset', $reminderOffset)
                ->exists();

            if ($exists) {
                return;
            }
        }

        $notification = Notification::create([
            'user_id' => $recipient->id,
            'sender_name' => 'Lokacara',
            'message' => $body,
            'type' => 'system',
            'category' => $category,
            'target' => $target,
            'event_id' => $event?->id,
            'is_read' => false,
        ]);

        if (in_array($category, self::EMAIL_AND_PUSH)) {
            SendNotificationEmailJob::dispatch($recipient, $category, $title, $body, $event, $reminderOffset);
        }

        $sendPush = true;
        if ($respectEnabled && !$recipient->notifications_enabled) {
            $sendPush = false;
        }

        if ($sendPush) {
            SendPushNotificationJob::dispatch($recipient, $category, $title, $body, $target, $event?->id);
        }

        if ($event) {
            EventNotificationDelivery::create([
                'event_id' => $event->id,
                'user_id' => $recipient->id,
                'category' => $category,
                'reminder_offset' => $reminderOffset,
                'notification_id' => $notification->id,
                'push_sent_at' => $sendPush ? now() : null,
                'email_sent_at' => in_array($category, self::EMAIL_AND_PUSH) ? now() : null,
            ]);
        }
    }
}
