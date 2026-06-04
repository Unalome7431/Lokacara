<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;

class AttendanceApiController extends Controller
{
    public function ticket(Request $request, Event $event)
    {
        $registration = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'event' => $event,
            'registration' => $registration,
        ]);
    }

    public function scan(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'qr_token' => 'required|uuid'
        ]);

        $registration = EventRegistration::with('user')
            ->where('event_id', $event->id)
            ->where('qr_token', $request->qr_token)
            ->first();

        if (!$registration) {
            return response()->json(['message' => 'Invalid QR Token for this event.'], 404);
        }

        if ($registration->checked_in_at) {
            return response()->json(['message' => 'User ' . $registration->user->name . ' has already checked in.'], 400);
        }

        $registration->update([
            'checked_in_at' => now(),
            'status' => 'present'
        ]);

        return response()->json([
            'message' => 'User ' . $registration->user->name . ' successfully checked in.',
            'registration' => $registration
        ]);
    }

    public function toggle(Request $request, Event $event, EventRegistration $registration)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($registration->event_id !== $event->id) {
            return response()->json(['message' => 'Registration not found for this event'], 404);
        }

        $isCheckingIn = is_null($registration->checked_in_at);

        $registration->update([
            'checked_in_at' => $isCheckingIn ? now() : null,
            'status' => $isCheckingIn ? 'present' : 'registered'
        ]);

        $statusMsg = $isCheckingIn ? 'checked in' : 'undone (checking out)';
        return response()->json([
            'message' => "Attendance manually $statusMsg.",
            'registration' => $registration
        ]);
    }
}
