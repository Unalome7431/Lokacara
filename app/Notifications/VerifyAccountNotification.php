<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyAccountNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private $otpCode;

    /**
     * Create a new notification instance.
     */
    public function __construct($otpCode = null)
    {
        $this->otpCode = $otpCode;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $name = $notifiable->name ?? 'User';

        $message = (new MailMessage)
            ->subject('Lokacara - Verify Your Email')
            ->greeting('Hello '.$name.'!');

        if ($this->otpCode) {
            return $message
                ->line('Please enter the following 6-digit code in Lokacara App.')
                ->line('**'.$this->otpCode.'**')
                ->line('This code will expire in 5 minutes.');
        }

        // For Web: Generate a signed URL
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );

        return $message
            ->line('Please click the button below to verify your email address.')
            ->action('Verify Email', $verificationUrl)
            ->line('This link will expire in 60 minutes.');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
