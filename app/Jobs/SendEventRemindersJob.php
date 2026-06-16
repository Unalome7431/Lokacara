<?php

namespace App\Jobs;

use App\Models\Event;
use App\Services\NotificationDispatchService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendEventRemindersJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Event $event)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(NotificationDispatchService $notifications): void
    {
        $this->event->eventRegistrations()->with('user')->chunk(100, function ($registrations) use ($notifications) {
            foreach ($registrations as $registration) {
                if ($registration->user) {
                    $notifications->dispatch(
                        recipient: $registration->user,
                        category: 'event_reminder',
                        title: 'Reminder event',
                        body: "Event {$this->event->title} akan dimulai.",
                        target: 'event_detail',
                        event: $this->event,
                    );
                }
            }
        });
    }
}
