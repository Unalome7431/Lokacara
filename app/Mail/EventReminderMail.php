<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Event $event,
        public User $user,
        public ?string $reminderOffset = null
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = 'Pengingat Event: '.$this->event->title;

        if ($this->reminderOffset) {
            $subject = match ($this->reminderOffset) {
                'H-30' => 'Pengingat 30 Hari: Event '.$this->event->title.' akan segera dimulai!',
                'H-7' => 'Pengingat 7 Hari: Event '.$this->event->title.' akan segera dimulai!',
                'H-3' => 'Pengingat 3 Hari: Event '.$this->event->title.' akan segera dimulai!',
                'H-1' => 'Pengingat 1 Hari: Event '.$this->event->title.' akan dimulai besok!',
                'H-DAY' => 'Pengingat Hari-H: Event '.$this->event->title.' dimulai hari ini!',
                'H-3H' => 'Pengingat 3 Jam: Event '.$this->event->title.' akan dimulai dalam 3 jam!',
                'H-1H' => 'Pengingat 1 Jam: Event '.$this->event->title.' akan dimulai dalam 1 jam!',
                'H-START' => 'Event Dimulai: Event '.$this->event->title.' dimulai sekarang!',
                default => $subject,
            };
        }

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.event_reminder',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
