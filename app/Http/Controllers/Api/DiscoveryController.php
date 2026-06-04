<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DiscoveryController extends Controller
{
    public function index()
    {
        // Upcoming events with minimum view_count of 50, sorted by popularity (view_count / capacity)
        $events = Event::with(['category', 'user'])
            ->where('start_datetime', '>=', now())
            ->where('view_count', '>=', 50)
            ->orderByRaw('(view_count * 1.0 / COALESCE(NULLIF(capacity, 0), 1)) DESC')
            ->take(20)
            ->get();

        return response()->json(['data' => $events], 200);
    }

    public function search(Request $request)
    {
        $query = Event::with(['category', 'user'])->where('start_datetime', '>=', now());

        if ($request->filled('keyword')) {
            $query->where('title', 'like', '%' . $request->keyword . '%');
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Default sort by latest upcoming
        $events = $query->orderBy('start_datetime', 'asc')->paginate(15);

        return response()->json($events, 200);
    }

    public function show(Request $request, Event $event)
    {
        // View Count Anti-Spam (tracked by IP or User ID)
        $identifier = $request->user('sanctum') ? 'user_' . $request->user('sanctum')->id : 'ip_' . $request->ip();
        $cacheKey = "event_{$event->id}_view_{$identifier}";

        if (!Cache::has($cacheKey)) {
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
            'is_registered' => $isRegistered
        ], 200);
    }
}
