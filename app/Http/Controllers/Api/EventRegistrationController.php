<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EventRegistrationService;

class EventRegistrationController extends Controller
{
    public function __construct(private EventRegistrationService $registrationService) {}

    public function store($eventId)
    {
        $success = $this->registrationService->joinEvent($eventId);

        if (!$success) {
            return response()->json(['message' => 'Already joined this event.'], 400);
        }

        return response()->json(['message' => 'Successfully joined the event!']);
    }
}
