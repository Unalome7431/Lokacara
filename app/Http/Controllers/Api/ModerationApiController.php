<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventReport;
use Illuminate\Http\Request;

class ModerationApiController extends Controller
{
    /**
     * Report an event.
     */
    public function reportEvent(Request $request, Event $event)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($event->status === 'banned' || $event->status === 'cancelled') {
            return response()->json(['message' => 'This event cannot be reported anymore.'], 400);
        }

        $existingReport = EventReport::where('event_id', $event->id)
            ->where('reporter_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if ($existingReport) {
            return response()->json(['message' => 'You already have a pending report for this event.'], 400);
        }

        EventReport::create([
            'event_id' => $event->id,
            'reporter_id' => $request->user()->id,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Event reported successfully'], 201);
    }
}
