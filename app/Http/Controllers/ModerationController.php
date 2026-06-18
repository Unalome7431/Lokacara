<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventReport;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    /**
     * Report an event.
     */
    public function reportEvent(Request $request, Event $event)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:100',
            'description' => 'required|string|max:2000',
        ]);

        if ($event->status === 'banned' || $event->status === 'cancelled') {
            return back()->with('error', 'This event cannot be reported anymore.');
        }

        $existingReport = EventReport::where('event_id', $event->id)
            ->where('reporter_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if ($existingReport) {
            return back()->with('error', 'You already have a pending report for this event.');
        }

        EventReport::create([
            'event_id' => $event->id,
            'reporter_id' => $request->user()->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Event reported successfully to the admin team.');
    }
}
