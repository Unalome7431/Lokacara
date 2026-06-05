<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AttendanceApiController extends Controller
{
    #[OA\Get(
        path: '/api/events/{event}/attendance/qr',
        summary: 'Get attendance QR ticket for an event',
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
        description: 'QR ticket data',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'event', ref: '#/components/schemas/Event'),
                new OA\Property(property: 'registration', ref: '#/components/schemas/EventRegistration'),
            ]
        )
    )]
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

    #[OA\Post(
        path: '/api/organizer/events/{event}/attendance/scan',
        summary: 'Scan QR token to check in a participant',
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
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['qr_token'],
            properties: [
                new OA\Property(property: 'qr_token', type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Successfully checked in',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string'),
                new OA\Property(property: 'registration', ref: '#/components/schemas/EventRegistration'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Already checked in or invalid token')]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    #[OA\Response(response: 404, description: 'Invalid QR token for this event')]
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

    #[OA\Patch(
        path: '/api/organizer/events/{event}/attendance/{registration}/toggle',
        summary: 'Manually toggle attendance check-in/check-out',
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
    #[OA\Parameter(
        name: 'registration',
        in: 'path',
        description: 'Registration ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Attendance toggled',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string'),
                new OA\Property(property: 'registration', ref: '#/components/schemas/EventRegistration'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    #[OA\Response(response: 404, description: 'Registration not found for this event')]
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
