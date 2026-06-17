<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Services\NotificationDispatchService;
use Illuminate\Console\Command;

class SendEventRemindersCommand extends Command
{
    protected $signature = 'events:send-reminders';

    protected $description = 'Send event reminders (H-30, H-7, H-3, H-1, H-DAY, H-3H, H-1H, H-START) and bookmark reminders';

    public function handle(NotificationDispatchService $notifications): void
    {
        $now = now();

        $offsets = [
            'H-30' => $now->copy()->addDays(30),
            'H-7' => $now->copy()->addDays(7),
            'H-3' => $now->copy()->addDays(3),
            'H-1' => $now->copy()->addDay(),
            'H-3H' => $now->copy()->addHours(3),
            'H-1H' => $now->copy()->addHour(),
            'H-START' => $now->copy(),
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
                        if (! $registration->user) {
                            continue;
                        }

                        $body = match ($label) {
                            'H-3H' => "Event {$event->title} akan dimulai dalam 3 jam.",
                            'H-1H' => "Event {$event->title} akan dimulai dalam 1 jam.",
                            'H-START' => "Event {$event->title} dimulai sekarang.",
                            'H-30' => "Event {$event->title} akan dimulai dalam 30 hari.",
                            'H-7' => "Event {$event->title} akan dimulai dalam 7 hari.",
                            'H-3' => "Event {$event->title} akan dimulai dalam 3 hari.",
                            'H-1' => "Event {$event->title} akan dimulai besok.",
                            default => "Event {$event->title} akan dimulai.",
                        };

                        $notifications->dispatch(
                            recipient: $registration->user,
                            category: 'event_reminder',
                            title: 'Reminder event',
                            body: $body,
                            target: 'event_detail',
                            event: $event,
                            reminderOffset: $label,
                        );
                    }
                });
            }
        }

        // Process H-DAY reminders at exactly 00:00 of the event day
        if ($now->format('H:i') === '00:00') {
            $eventsToday = Event::whereDate('start_datetime', $now->toDateString())
                ->whereNull('deleted_at')
                ->get();

            foreach ($eventsToday as $event) {
                $event->eventRegistrations()->with('user')->chunk(100, function ($registrations) use ($event, $notifications) {
                    foreach ($registrations as $registration) {
                        if (! $registration->user) {
                            continue;
                        }

                        $notifications->dispatch(
                            recipient: $registration->user,
                            category: 'event_reminder',
                            title: 'Reminder event',
                            body: "Event {$event->title} dimulai hari ini.",
                            target: 'event_detail',
                            event: $event,
                            reminderOffset: 'H-DAY',
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
                if (! $bookmark->user) {
                    continue;
                }

                $isRegistered = $event->eventRegistrations()
                    ->where('user_id', $bookmark->user_id)
                    ->exists();

                if ($isRegistered) {
                    continue;
                }

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
