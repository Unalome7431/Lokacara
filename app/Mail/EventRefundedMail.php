<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventRefundedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Event $event,
        public User $user
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pengembalian Dana (Refund) Tiket Event - '.$this->event->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.event_refunded',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
