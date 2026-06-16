<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Jobs\SendEventRemindersJob;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class CommunicationApiController extends Controller
{
    #[OA\Post(
        path: '/api/organizer/events/{event}/reminders',
        summary: 'Send reminder notifications to all participants',
        tags: ['Organizer'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'event',
        in: 'path',
        description: 'Event ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Reminders are being sent',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Reminder notifications are being sent in the background.'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    public function sendReminder(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Dispatch the job to the queue
        SendEventRemindersJob::dispatch($event);

        return response()->json([
            'message' => 'Reminder notifications are being sent in the background.'
        ]);
    }
}
