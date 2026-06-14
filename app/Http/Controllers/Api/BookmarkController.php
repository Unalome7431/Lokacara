<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class BookmarkController extends Controller
{
    #[OA\Get(
        path: '/api/bookmarks',
        summary: 'Get bookmarked events for authenticated user',
        tags: ['Bookmarks'],
        security: [['sanctum' => []]]
    )]
    #[OA\Response(
        response: 200,
        description: 'List of bookmarked events',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'data',
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/Event')
                ),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    public function index(Request $request)
    {
        $user = $request->user();

        $bookmarkedEventIds = $user->bookmarks()->pluck('event_id');

        $events = Event::with(['category', 'user'])
            ->whereIn('id', $bookmarkedEventIds)
            ->orderBy('start_datetime', 'asc')
            ->get();

        return response()->json([
            'data' => $events,
        ], 200);
    }

    #[OA\Post(
        path: '/api/bookmarks/{eventId}',
        summary: 'Bookmark an event',
        tags: ['Bookmarks'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'eventId',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 201,
        description: 'Event bookmarked successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Event bookmarked successfully'),
            ]
        )
    )]
    #[OA\Response(
        response: 400,
        description: 'Event already bookmarked',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Event already bookmarked'),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    public function store(Request $request, Event $event)
    {
        $user = $request->user();

        if ($user->bookmarks()->where('event_id', $event->id)->exists()) {
            return response()->json(['message' => 'Event already bookmarked'], 400);
        }

        $user->bookmarks()->create(['event_id' => $event->id]);

        return response()->json(['message' => 'Event bookmarked successfully'], 201);
    }

    #[OA\Delete(
        path: '/api/bookmarks/{eventId}',
        summary: 'Remove event bookmark',
        tags: ['Bookmarks'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'eventId',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Bookmark removed successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Bookmark removed successfully'),
            ]
        )
    )]
    #[OA\Response(
        response: 400,
        description: 'Bookmark not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Bookmark not found'),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    public function destroy(Request $request, Event $event)
    {
        $user = $request->user();

        $deleted = $user->bookmarks()->where('event_id', $event->id)->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Bookmark not found'], 400);
        }

        return response()->json(['message' => 'Bookmark removed successfully']);
    }
}
