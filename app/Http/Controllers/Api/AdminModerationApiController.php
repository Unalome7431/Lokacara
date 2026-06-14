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
use OpenApi\Attributes as OA;

class AdminModerationApiController extends Controller
{
    #[OA\Get(
        path: '/api/admin/moderation',
        summary: 'Get moderation queue (all event reports)',
        tags: ['Admin Moderation'],
        security: [['sanctum' => []], ['ability:admin' => []]]
    )]
    #[OA\Response(
        response: 200,
        description: 'Paginated list of reports',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'data',
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/EventReport')
                ),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (admin only)')]
    public function index(Request $request)
    {
        $reports = EventReport::with(['user', 'event'])
            ->latest()
            ->paginate(15);
            
        return response()->json(['data' => $reports]);
    }

    #[OA\Get(
        path: '/api/admin/reports/{report}',
        summary: 'Get single report detail',
        tags: ['Admin Moderation'],
        security: [['sanctum' => []], ['ability:admin' => []]]
    )]
    #[OA\Parameter(
        name: 'report',
        in: 'path',
        description: 'Report ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Report details',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'data', ref: '#/components/schemas/EventReport'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (admin only)')]
    public function showReport(EventReport $report)
    {
        $report->load(['user', 'event.user']);
        
        return response()->json(['data' => $report]);
    }

    #[OA\Post(
        path: '/api/admin/events/{event}/ban',
        summary: 'Ban an event (resolves reports, notifies organizer & participants)',
        tags: ['Admin Moderation'],
        security: [['sanctum' => []], ['ability:admin' => []]]
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
        description: 'Event banned',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Event has been successfully banned, participants removed, and organizer notified'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Event already banned')]
    #[OA\Response(response: 403, description: 'Forbidden (admin only)')]
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

    #[OA\Post(
        path: '/api/admin/users/{user}/ban',
        summary: 'Ban a user (revoke tokens and delete account)',
        tags: ['Admin Moderation'],
        security: [['sanctum' => []], ['ability:admin' => []]]
    )]
    #[OA\Parameter(
        name: 'user',
        in: 'path',
        description: 'User ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'User banned',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'User access has been revoked'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Cannot ban yourself')]
    #[OA\Response(response: 403, description: 'Forbidden (admin only)')]
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
