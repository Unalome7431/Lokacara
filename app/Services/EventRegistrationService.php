<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class EventRegistrationService
{
    public function __construct(
        private NotificationDispatchService $notifications,
    ) {}

    public function joinEvent($eventId)
    {
        $userId = Auth::id();

        if (EventRegistration::where('user_id', $userId)->where('event_id', $eventId)->exists()) {
            return false;
        }

        $registration = EventRegistration::create([
            'user_id' => $userId,
            'event_id' => $eventId,
            'registered_at' => now(),
            'qr_token' => Str::uuid(),
            'status' => 'confirmed'
        ]);

        $event = Event::find($eventId);
        $user = Auth::user();

        if ($event && $user) {
            $this->notifications->dispatch(
                recipient: $user,
                category: 'registration_success',
                title: 'Pendaftaran berhasil',
                body: "Kamu berhasil terdaftar di {$event->title}.",
                target: 'tickets',
                event: $event,
            );

            $this->notifications->dispatch(
                recipient: $event->user,
                category: 'host_new_registration',
                title: 'Peserta baru',
                body: "{$user->name} baru mendaftar di event {$event->title}.",
                target: 'event_detail',
                event: $event,
            );

            if ($event->capacity) {
                $count = $event->eventRegistrations()->count();
                $pct = ($count / $event->capacity) * 100;

                foreach ([80, 90, 100] as $threshold) {
                    if ($pct >= $threshold && $pct < $threshold + 10) {
                        $this->notifications->dispatch(
                            recipient: $event->user,
                            category: 'event_capacity_warning',
                            title: 'Kapasitas hampir penuh',
                            body: "Event {$event->title} sudah {$threshold}% terisi ({$count}/{$event->capacity}).",
                            target: 'event_detail',
                            event: $event,
                            reminderOffset: "threshold_{$threshold}",
                        );
                    }
                }
            }
        }

        return $registration;
    }

    public function leaveEvent($eventId)
    {
        $userId = Auth::id();

        $registration = EventRegistration::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->first();

        if (!$registration) {
            return false;
        }

        $event = $registration->event;
        $user = Auth::user();

        $registration->delete();

        if ($event && $user) {
            $this->notifications->dispatch(
                recipient: $event->user,
                category: 'host_registration_cancelled',
                title: 'Peserta batal',
                body: "{$user->name} membatalkan pendaftaran di event {$event->title}.",
                target: 'event_detail',
                event: $event,
            );
        }

        return true;
    }
}

