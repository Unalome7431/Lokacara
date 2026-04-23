<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\EventRegistrationService;

class EventRegistrationController extends Controller
{
    public function __construct(private EventRegistrationService $registrationService) {}

    public function store($eventId)
    {
        $success = $this->registrationService->joinEvent($eventId);

        if (!$success) {
            return redirect()->back()->with('error', 'Already joined this event.');
        }

        return redirect()->route('dashboard')->with('success', 'Successfully joined the event!');
    }
}
