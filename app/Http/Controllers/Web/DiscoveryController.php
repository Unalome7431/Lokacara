<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DiscoveryController extends Controller
{
    public function index()
    {
        // All upcoming events
        $allUpcomingEvents = Event::with(['category', 'user'])
            ->where('start_datetime', '>=', now())
            ->orderBy('start_datetime', 'asc')
            ->get();

        // Popular events sorted by popularity ratio (views/capacity)
        $popularEvents = Event::with(['category', 'user'])
            ->where('start_datetime', '>=', now())
            ->orderByRaw('(view_count * 1.0 / COALESCE(NULLIF(capacity, 0), 1)) DESC')
            ->take(5)
            ->get();

        // User's joined upcoming events
        $joinedEvents = [];
        if (Auth::check()) {
            $joinedEvents = Event::whereHas('eventRegistrations', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->with(['category', 'user'])
            ->where('start_datetime', '>=', now())
            ->orderBy('start_datetime', 'asc')
            ->get();
        }

        // All categories
        $categories = Category::all();

        return Inertia::render('Home', [
            'events' => $allUpcomingEvents,
            'popularEvents' => $popularEvents,
            'joinedEvents' => $joinedEvents,
            'categories' => $categories,
        ]);
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

        $events = $query->orderBy('start_datetime', 'asc')->paginate(15);
        $categories = Category::all();

        return Inertia::render('Events/Search', [
            'events' => $events,
            'categories' => $categories,
            'filters' => $request->only('keyword', 'category_id')
        ]);
    }

    public function show(Request $request, Event $event)
    {
        // View Count Anti-Spam (tracked by IP or User ID)
        $identifier = Auth::check() ? 'user_' . Auth::id() : 'ip_' . $request->ip();
        $cacheKey = "event_{$event->id}_view_{$identifier}";

        if (!Cache::has($cacheKey)) {
            $event->increment('view_count');
            Cache::put($cacheKey, true, now()->addHours(2)); // Block subsequent view count increments for 2 hours
        }

        $event->load(['category', 'user'])->loadCount('eventRegistrations');

        $isRegistered = false;
        $certificateUrl = null;

        if (Auth::check()) {
            $registration = $event->eventRegistrations()->where('user_id', Auth::id())->first();
            $isRegistered = (bool) $registration;
            
            if ($registration) {
                $certificate = \App\Models\Certificate::where('registration_id', $registration->id)->first();
                if ($certificate) {
                    $certificateUrl = route('certificates.download', ['certificate' => $certificate->id]);
                }
            }
        }

        return Inertia::render('Events/Show', [
            'event' => $event,
            'isRegistered' => $isRegistered,
            'certificateUrl' => $certificateUrl,
        ]);
    }
}
