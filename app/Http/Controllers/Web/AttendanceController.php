<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function ticket(Request $request, Event $event)
    {
        $registration = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return Inertia::render('Events/Ticket', [
            'event' => $event,
            'registration' => $registration,
        ]);
    }

    public function scan(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'qr_token' => 'required|uuid'
        ]);

        $registration = EventRegistration::with('user')
            ->where('event_id', $event->id)
            ->where('qr_token', $request->qr_token)
            ->first();

        if (!$registration) {
            return redirect()->back()->withErrors(['qr_token' => 'Invalid QR Token for this event.']);
        }

        if ($registration->checked_in_at) {
            return redirect()->back()->with('warning', 'User ' . $registration->user->name . ' has already checked in.');
        }

        $registration->update([
            'checked_in_at' => now(),
            'status' => 'present'
        ]);

        return redirect()->back()->with('success', 'User ' . $registration->user->name . ' successfully checked in.');
    }

    public function toggle(Request $request, Event $event, EventRegistration $registration)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        if ($registration->event_id !== $event->id) {
            abort(404, 'Registration not found for this event');
        }

        $isCheckingIn = is_null($registration->checked_in_at);

        $registration->update([
            'checked_in_at' => $isCheckingIn ? now() : null,
            'status' => $isCheckingIn ? 'present' : 'registered'
        ]);

        $statusMsg = $isCheckingIn ? 'checked in' : 'undone (checking out)';
        return redirect()->back()->with('success', "Attendance manually $statusMsg.");
    }
}
