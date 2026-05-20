<?php

namespace App\Jobs;

use App\Models\Event;
use App\Mail\EventReminderMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

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
    public function handle(): void
    {
        $this->event->eventRegistrations()->with('user')->chunk(100, function ($registrations) {
            foreach ($registrations as $registration) {
                if ($registration->user) {
                    Mail::to($registration->user->email)->send(new EventReminderMail($this->event, $registration->user));
                }
            }
        });
    }
}
