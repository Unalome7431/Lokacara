<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\EventReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DiscoveryController extends Controller
{
    public function index()
    {
        // All upcoming events
        $allUpcomingEvents = Event::with(['category', 'user'])
            ->where('status', 'active')
            ->where('start_datetime', '>=', now())
            ->orderBy('start_datetime', 'asc')
            ->get();

        // Popular events sorted by popularity ratio (views/capacity)
        $popularEvents = Event::with(['category', 'user'])
            ->where('status', 'active')
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
                ->where('status', 'active')
                ->where('start_datetime', '>=', now())
                ->orderBy('start_datetime', 'asc')
                ->get();
        }

        // All categories
        $categories = Category::all();

        return Inertia::render('Home/Home', [
            'events' => $allUpcomingEvents,
            'popularEvents' => $popularEvents,
            'joinedEvents' => $joinedEvents,
            'categories' => $categories,
        ]);
    }

    public function search(Request $request)
    {
        $query = Event::with(['category', 'user'])
            ->where('status', 'active')
            ->where('start_datetime', '>=', now());

        if ($request->filled('keyword')) {
            $query->whereRaw('LOWER(title) LIKE ?', ['%'.strtolower($request->keyword).'%']);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        if ($request->filled('start_date')) {
            $query->where('start_datetime', '>=', $request->start_date.' 00:00:00');
        }

        if ($request->filled('end_date')) {
            $query->where('start_datetime', '<=', $request->end_date.' 23:59:59');
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'popular');
        if ($sortBy === 'popular') {
            $query->orderByRaw('(view_count * 1.0 / COALESCE(NULLIF(capacity, 0), 1)) DESC');
        } elseif ($sortBy === 'date_asc') {
            $query->orderBy('start_datetime', 'asc');
        } elseif ($sortBy === 'date_desc') {
            $query->orderBy('start_datetime', 'desc');
        } elseif ($sortBy === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sortBy === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sortBy === 'nearest' && $request->filled('latitude') && $request->filled('longitude')) {
            $lat = (float) $request->latitude;
            $lng = (float) $request->longitude;
            $driver = $query->getConnection()->getDriverName();
            if ($driver === 'sqlite') {
                $query->orderByRaw('(CASE WHEN latitude IS NULL THEN 1 ELSE 0 END) ASC')
                    ->orderByRaw('((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?)) ASC', [$lat, $lat, $lng, $lng]);
            } else {
                $query->orderByRaw('(CASE WHEN latitude IS NULL THEN 1 ELSE 0 END) ASC')
                    ->orderByRaw('(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) ASC', [$lat, $lng, $lat]);
            }
        } else {
            $query->orderBy('start_datetime', 'asc');
        }

        $events = $query->paginate(15)->withQueryString();
        $categories = Category::all();

        return Inertia::render('Event/Search', [
            'events' => $events,
            'categories' => $categories,
            'filters' => [
                'keyword' => $request->keyword ?? '',
                'category_id' => $request->category_id ? (int) $request->category_id : null,
                'type' => $request->type ?? 'all',
                'min_price' => $request->min_price ?? '',
                'max_price' => $request->max_price ?? '',
                'start_date' => $request->start_date ?? '',
                'end_date' => $request->end_date ?? '',
                'sort_by' => $sortBy,
                'latitude' => $request->latitude ? (float) $request->latitude : null,
                'longitude' => $request->longitude ? (float) $request->longitude : null,
            ],
        ]);
    }

    public function show(Request $request, Event $event)
    {
        // View Count Anti-Spam (tracked by IP or User ID)
        $identifier = Auth::check() ? 'user_'.Auth::id() : 'ip_'.$request->ip();
        $cacheKey = "event_{$event->id}_view_{$identifier}";

        if (! Cache::has($cacheKey)) {
            $event->increment('view_count');
            Cache::put($cacheKey, true, now()->addHours(2)); // Block subsequent view count increments for 2 hours
        }

        $event->load(['category', 'user'])->loadCount('eventRegistrations');

        $isRegistered = false;
        $certificateUrl = null;
        $reports = [];

        if (Auth::check()) {
            if (in_array(Auth::user()->role, ['admin', 'super_admin'])) {
                $reports = EventReport::where('event_id', $event->id)
                    ->with('user')
                    ->latest()
                    ->get();
            }

            $registration = $event->eventRegistrations()->where('user_id', Auth::id())->first();
            $isRegistered = (bool) $registration;

            if ($registration) {
                $certificate = Certificate::where('registration_id', $registration->id)->first();
                if ($certificate) {
                    $certificateUrl = route('certificates.download', ['certificate' => $certificate->id]);
                }
            }
        }

        return Inertia::render('Event/EventDetail', [
            'event' => $event,
            'isRegistered' => $isRegistered,
            'certificateUrl' => $certificateUrl,
            'reports' => $reports,
        ]);
    }
}
