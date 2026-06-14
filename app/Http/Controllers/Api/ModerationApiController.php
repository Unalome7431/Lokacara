<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventReport;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ModerationApiController extends Controller
{
    #[OA\Post(
        path: '/api/events/{event}/report',
        summary: 'Report an event for moderation review',
        tags: ['Participant'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'event',
        in: 'path',
        description: 'Event ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['reason'],
            properties: [
                new OA\Property(property: 'reason', type: 'string', maxLength: 500, example: 'Inappropriate content'),
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Event reported',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Event reported successfully'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Already reported or cannot be reported')]
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
