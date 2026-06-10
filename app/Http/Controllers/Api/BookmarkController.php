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
}
