<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventManagementController extends Controller
{
    private function validateEvent(Request $request)
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'required|string',
            'type' => 'required|in:online,offline',
            
            // Rules for offline
            'location_name' => 'required_if:type,offline|nullable|string|max:255',
            'address' => 'required_if:type,offline|nullable|string',
            'latitude' => 'required_if:type,offline|nullable|numeric|between:-90,90',
            'longitude' => 'required_if:type,offline|nullable|numeric|between:-180,180',
            
            // Rules for online
            'platform_name' => 'required_if:type,online|nullable|string|max:255',
            'link' => 'required_if:type,online|nullable|url|max:255',
            
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after_or_equal:start_datetime',
            'capacity' => 'nullable|integer|min:1',
            
            // Poster validation: only required on create; max 5MB
            'poster' => ($request->isMethod('put') || $request->isMethod('patch') || $request->route('event') ? 'nullable' : 'required') . '|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);
    }

    public function index(Request $request)
    {
        $events = Event::with('category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);
            
        return Inertia::render('Dashboard/Events/Index', [
            'events' => $events
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Events/Create');
    }

    public function store(Request $request)
    {
        $validated = $this->validateEvent($request);
        
        $event = new Event($validated);
        $event->user_id = $request->user()->id;
        
        if ($request->hasFile('poster')) {
            $event->poster = $request->file('poster')->store('posters', 'local');
        }

        $event->save();

        return redirect()->route('dashboard.events.index')->with('success', 'Event created successfully.');
    }

    public function edit(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('Dashboard/Events/Edit', [
            'event' => $event
        ]);
    }

    public function update(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $this->validateEvent($request);
        
        $event->fill($validated);

        if ($request->hasFile('poster')) {
            if ($event->getRawOriginal('poster') && Storage::disk('local')->exists($event->getRawOriginal('poster'))) {
                Storage::disk('local')->delete($event->getRawOriginal('poster'));
            }
            $event->poster = $request->file('poster')->store('posters', 'local');
        }

        // When switching types, nullify mismatched fields
        if ($event->type === 'online') {
            $event->location_name = null;
            $event->address = null;
            $event->latitude = null;
            $event->longitude = null;
        } else {
            $event->platform_name = null;
            $event->link = null;
        }

        $event->save();

        return redirect()->route('dashboard.events.index')->with('success', 'Event updated successfully.');
    }

    public function destroy(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            abort(403);
        }

        if ($event->getRawOriginal('poster') && Storage::disk('local')->exists($event->getRawOriginal('poster'))) {
            Storage::disk('local')->delete($event->getRawOriginal('poster'));
        }

        $event->delete();

        return redirect()->route('dashboard.events.index')->with('success', 'Event deleted successfully.');
    }

    public function attendees(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        $attendees = $event->eventRegistrations()
            ->with(['user:id,name,email,avatar_url'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Dashboard/Events/Attendees', [
            'event' => $event,
            'attendees' => $attendees
        ]);
    }
}
