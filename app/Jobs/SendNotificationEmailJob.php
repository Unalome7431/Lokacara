<?php

namespace App\Jobs;

use App\Mail\CertificateAvailableMail;
use App\Mail\RegistrationSuccessMail;
use App\Mail\EventReminderMail;
use App\Mail\EventUpdatedMail;
use App\Mail\EventCancelledForParticipantMail;
use App\Models\Event;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendNotificationEmailJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $recipient,
        public string $category,
        public string $title,
        public string $body,
        public ?Event $event,
        public ?string $reminderOffset = null,
    ) {}

    public function handle(): void
    {
        $mailable = match ($this->category) {
            'registration_success' => new RegistrationSuccessMail($this->event, $this->recipient),
            'event_reminder' => new EventReminderMail($this->event, $this->recipient, $this->reminderOffset),
            'event_updated' => new EventUpdatedMail($this->event, $this->recipient),
            'event_cancelled' => new EventCancelledForParticipantMail($this->event, $this->recipient),
            'certificate_available' => new CertificateAvailableMail($this->event, $this->recipient),
            default => null,
        };

        if ($mailable) {
            Mail::to($this->recipient->email)->send($mailable);
        }
    }
}
