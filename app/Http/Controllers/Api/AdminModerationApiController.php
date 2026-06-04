<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use App\Models\EventReport;
use App\Mail\EventBannedMail;
use App\Mail\EventCancelledForParticipantMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminModerationApiController extends Controller
{
    /**
     * Get admin moderation queue.
     */
    public function index(Request $request)
    {
        $reports = EventReport::with(['user', 'event'])
            ->latest()
            ->paginate(15);
            
        return response()->json(['data' => $reports]);
    }

    /**
     * Get single report detail.
     */
    public function showReport(EventReport $report)
    {
        $report->load(['user', 'event.user']);
        
        return response()->json(['data' => $report]);
    }

    /**
     * Ban an event.
     */
    public function banEvent(Request $request, Event $event)
    {
        if ($event->status === 'banned') {
            return response()->json(['message' => 'Event is already banned.'], 400);
        }

        $event->update(['status' => 'banned']);

        // Update active reports
        EventReport::where('event_id', $event->id)->where('status', 'pending')->update(['status' => 'resolved']);

        // Notify event organizer
        if ($event->user) {
            Mail::to($event->user->email)->send(new EventBannedMail($event));
        }

        // Handle participant removal & notification
        $registrations = $event->eventRegistrations()->with('user')->get();
        foreach ($registrations as $registration) {
            if ($registration->user) {
                Mail::to($registration->user->email)->send(new EventCancelledForParticipantMail($event, $registration->user));
            }
            $registration->update(['status' => 'cancelled']);
        }

        return response()->json(['message' => 'Event has been successfully banned, participants removed, and organizer notified']);
    }

    /**
     * Ban a user.
     */
    public function banUser(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot ban yourself.'], 400);
        }

        $user->tokens()->delete(); // Revoke Sanctum tokens
        // Assuming we delete or ban.
        $user->delete();

        return response()->json(['message' => 'User access has been revoked']);
    }
}
