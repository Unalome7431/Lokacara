<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;

class SendPushNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $recipient,
        public string $category,
        public string $title,
        public string $body,
        public string $target,
        public ?int $eventId,
    ) {}

    public function handle(Messaging $messaging): void
    {
        $tokens = $this->recipient->pushTokens()
            ->orderBy('last_used_at', 'desc')
            ->pluck('token')
            ->toArray();

        if (empty($tokens)) {
            return;
        }

        $data = [
            'category' => $this->category,
            'target' => $this->target,
            'title' => $this->title,
            'body' => $this->body,
        ];

        if ($this->eventId) {
            $data['event_id'] = (string) $this->eventId;
        }

        $message = CloudMessage::new()->withData($data);

        foreach ($tokens as $token) {
            try {
                $messaging->send($message->withToken($token));
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }
}
