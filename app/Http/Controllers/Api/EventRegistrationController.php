<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EventRegistrationService;
use OpenApi\Attributes as OA;

class EventRegistrationController extends Controller
{
    public function __construct(private EventRegistrationService $registrationService) {}

    #[OA\Post(
        path: '/api/events/{event}/join',
        summary: 'Join/register for an event',
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
    #[OA\Response(
        response: 200,
        description: 'Successfully joined the event',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Successfully joined the event!'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Already joined this event')]
    public function store($eventId)
    {
        $success = $this->registrationService->joinEvent($eventId);

        if (!$success) {
            return response()->json(['message' => 'Already joined this event.'], 400);
        }

        return response()->json(['message' => 'Successfully joined the event!']);
    }

    #[OA\Delete(
        path: '/api/events/{event}/join',
        summary: 'Leave/cancel registration for an event',
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
    #[OA\Response(
        response: 200,
        description: 'Successfully left the event',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Successfully left the event!'),
            ]
        )
    )]
    #[OA\Response(response: 404, description: 'Not registered for this event')]
    public function destroy($eventId)
    {
        $success = $this->registrationService->leaveEvent($eventId);

        if (!$success) {
            return response()->json(['message' => 'Not registered for this event.'], 404);
        }

        return response()->json(['message' => 'Successfully left the event!']);
    }
}

