<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use OpenApi\Attributes as OA;

class DiscoveryController extends Controller
{
    #[OA\Get(
        path: '/api/events/feed',
        summary: 'Get popular upcoming events feed',
        tags: ['Discovery'],
    )]
    #[OA\Response(
        response: 200,
        description: 'List of popular upcoming events',
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
    public function index()
    {
        // Upcoming events with minimum view_count of 50, sorted by popularity (view_count / capacity)
        $events = Event::with(['category', 'user'])
            ->where('status', 'active')
            ->where('start_datetime', '>=', now())
            ->where('view_count', '>=', 50)
            ->orderByRaw('(view_count * 1.0 / COALESCE(NULLIF(capacity, 0), 1)) DESC')
            ->take(20)
            ->get();

        return response()->json(['data' => $events], 200);
    }

    #[OA\Get(
        path: '/api/events/search',
        summary: 'Search events by keyword, category, and/or exact city location',
        tags: ['Discovery'],
    )]
    #[OA\Parameter(
        name: 'keyword',
        in: 'query',
        description: 'Search keyword (matches event title)',
        required: false,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Parameter(
        name: 'category_id',
        in: 'query',
        description: 'Filter by category ID',
        required: false,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Parameter(
        name: 'location',
        in: 'query',
        description: 'Filter by exact canonical city (case-insensitive)',
        required: false,
        schema: new OA\Schema(type: 'string', example: 'Surakarta')
    )]
    #[OA\Response(
        response: 200,
        description: 'Paginated list of events',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'data', type: 'array', items: new OA\Items(ref: '#/components/schemas/Event')),
                new OA\Property(property: 'current_page', type: 'integer'),
                new OA\Property(property: 'last_page', type: 'integer'),
                new OA\Property(property: 'per_page', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
            ]
        )
    )]
    public function search(Request $request)
    {
        $query = Event::with(['category', 'user'])
            ->where('status', 'active')
            ->where('start_datetime', '>=', now());

        if ($request->filled('keyword')) {
            $query->where('title', 'like', '%'.$request->keyword.'%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('location')) {
            $query->whereRaw('LOWER(city) = ?', [strtolower(trim($request->location))]);
        }

        // Default sort by latest upcoming
        $events = $query->orderBy('start_datetime', 'asc')->paginate(15);

        return response()->json($events, 200);
    }

    #[OA\Get(
        path: '/api/events/{event}',
        summary: 'Get event details with registration status',
        tags: ['Discovery'],
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
        description: 'Event details',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'event', ref: '#/components/schemas/Event'),
                new OA\Property(property: 'is_registered', type: 'boolean', example: false),
            ]
        )
    )]
    #[OA\Response(response: 404, description: 'Event not found')]
    public function show(Request $request, Event $event)
    {
        // View Count Anti-Spam (tracked by IP or User ID)
        $identifier = $request->user('sanctum') ? 'user_'.$request->user('sanctum')->id : 'ip_'.$request->ip();
        $cacheKey = "event_{$event->id}_view_{$identifier}";

        if (! Cache::has($cacheKey)) {
            $event->increment('view_count');
            Cache::put($cacheKey, true, now()->addHours(2)); // Block subsequent view count increments for 2 hours
        }

        $event->load(['category', 'user']);

        $isRegistered = false;
        if ($user = $request->user('sanctum')) {
            $isRegistered = $event->eventRegistrations()->where('user_id', $user->id)->exists();
        }

        return response()->json([
            'event' => $event,
            'is_registered' => $isRegistered,
        ], 200);
    }
}
