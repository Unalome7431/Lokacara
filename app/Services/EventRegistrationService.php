<?php

namespace App\Services;

use App\Models\EventRegistration;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class EventRegistrationService
{
    public function joinEvent($eventId)
    {
        $userId = Auth::id();

        // Check if already registered
        if (EventRegistration::where('user_id', $userId)->where('event_id', $eventId)->exists()) {
            return false;
        }

        return EventRegistration::create([
            'user_id' => $userId,
            'event_id' => $eventId,
            'registered_at' => now(),
            'qr_token' => Str::uuid(),
            'status' => 'confirmed'
        ]);
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

        return $registration->delete();
    }
}

