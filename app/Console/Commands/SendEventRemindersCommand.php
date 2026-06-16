<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Services\NotificationDispatchService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendEventRemindersCommand extends Command
{
    protected $signature = 'events:send-reminders';
    protected $description = 'Send event reminders (H-7, H-3, H-1, H-DAY) and bookmark reminders';

    public function handle(NotificationDispatchService $notifications): void
    {
        $now = now();

        $offsets = [
            'H-7' => $now->copy()->addDays(7),
            'H-3' => $now->copy()->addDays(3),
            'H-1' => $now->copy()->addDay(),
            'H-DAY' => $now->copy(),
        ];

        foreach ($offsets as $label => $targetTime) {
            $windowStart = $targetTime->copy()->subMinute();
            $windowEnd = $targetTime->copy()->addMinute();

            $events = Event::whereBetween('start_datetime', [$windowStart, $windowEnd])
                ->whereNull('deleted_at')
                ->get();

            foreach ($events as $event) {
                $event->eventRegistrations()->with('user')->chunk(100, function ($registrations) use ($event, $label, $notifications) {
                    foreach ($registrations as $registration) {
                        if (!$registration->user) continue;

                        $notifications->dispatch(
                            recipient: $registration->user,
                            category: 'event_reminder',
                            title: 'Reminder event',
                            body: "Event {$event->title} akan dimulai.",
                            target: 'event_detail',
                            event: $event,
                            reminderOffset: $label,
                        );
                    }
                });
            }
        }

        $this->handleBookmarkReminders($notifications);
    }

    private function handleBookmarkReminders(NotificationDispatchService $notifications): void
    {
        $windowStart = now()->copy();
        $windowEnd = now()->copy()->addHours(24);

        $events = Event::whereBetween('start_datetime', [$windowStart, $windowEnd])
            ->whereNull('deleted_at')
            ->get();

        foreach ($events as $event) {
            $bookmarks = $event->bookmarks()->with('user')->get();

            foreach ($bookmarks as $bookmark) {
                if (!$bookmark->user) continue;

                $isRegistered = $event->eventRegistrations()
                    ->where('user_id', $bookmark->user_id)
                    ->exists();

                if ($isRegistered) continue;

                $notifications->dispatch(
                    recipient: $bookmark->user,
                    category: 'bookmarked_event_reminder',
                    title: 'Event yang kamu simpan',
                    body: "Event {$event->title} akan segera dimulai, daftar sekarang.",
                    target: 'event_detail',
                    event: $event,
                    reminderOffset: 'bookmark_24h',
                );
            }
        }
    }
}
