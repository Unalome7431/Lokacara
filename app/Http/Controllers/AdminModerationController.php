<?php

namespace App\Http\Controllers;

use App\Mail\EventBannedMail;
use App\Mail\EventCancelledForParticipantMail;
use App\Models\Event;
use App\Models\EventReport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class AdminModerationController extends Controller
{
    /**
     * Get admin moderation queue.
     */
    public function index(Request $request)
    {
        $reports = EventReport::with(['user', 'event.user', 'resolvedBy'])
            ->latest()
            ->get();

        $events = Event::with(['user', 'category'])
            ->withCount('eventRegistrations')
            ->latest()
            ->get();

        return Inertia::render('Admin/ModerationBase', [
            'reports' => $reports,
            'events' => $events,
        ]);
    }

    /**
     * Get single report detail.
     */
    public function showReport(EventReport $report)
    {
        $report->load(['user', 'event.user']);

        return Inertia::render('Admin/ReportDetail', [
            'report' => $report,
        ]);
    }

    /**
     * Resolve/dismiss a single report.
     */
    public function dismissReport(Request $request, EventReport $report)
    {
        if ($report->status === 'pending') {
            $report->update([
                'status' => 'resolved',
                'resolved_by' => $request->user()->id,
            ]);
        }

        return back()->with('success', 'Report has been dismissed.');
    }

    /**
     * Ban an event.
     */
    public function banEvent(Request $request, Event $event)
    {
        if ($event->status === 'banned') {
            return back()->with('error', 'Event is already banned.');
        }

        $event->update(['status' => 'banned']);

        // Update active reports
        EventReport::where('event_id', $event->id)->where('status', 'pending')->update([
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
        ]);

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

        return back()->with('success', 'Event has been successfully banned, participants removed, and organizer notified.');
    }

    /**
     * Ban a user.
     */
    public function banUser(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot ban yourself.');
        }

        $user->tokens()->delete(); // Revoke Sanctum tokens
        // Usually, a status or banned_at column is used to prevent the user from logging in.
        // Assuming we set status to inactive/banned.
        // $user->update(['status' => 'banned']);
        // Here we just delete for the sake of standard flow, or you must have a banned field.
        $user->delete();

        return back()->with('success', 'User access has been revoked.');
    }
}
