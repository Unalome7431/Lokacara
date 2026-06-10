<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class EventManagementApiController extends Controller
{
    private function validateEvent(Request $request)
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'required|string',
            'price' => 'nullable|integer|min:0',
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

    #[OA\Get(
        path: '/api/organizer/events',
        summary: 'List my events (paginated)',
        tags: ['Organizer'],
        security: [['sanctum' => []]]
    )]
    #[OA\Response(
        response: 200,
        description: 'Paginated list of organizer events',
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
    public function index(Request $request)
    {
        $events = Event::with('category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);
            
        return response()->json($events);
    }

    #[OA\Post(
        path: '/api/organizer/events',
        summary: 'Create a new event',
        tags: ['Organizer'],
        security: [['sanctum' => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                required: ['title', 'description', 'type', 'start_datetime', 'end_datetime', 'poster'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', maxLength: 255, example: 'Summer Music Festival'),
                    new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 1),
                    new OA\Property(property: 'description', type: 'string', example: 'A great music event with live performances'),
                    new OA\Property(property: 'type', type: 'string', enum: ['online', 'offline'], example: 'offline'),
                    new OA\Property(property: 'location_name', type: 'string', example: 'Central Park'),
                    new OA\Property(property: 'address', type: 'string', example: '123 Main St, City'),
                    new OA\Property(property: 'latitude', type: 'number', format: 'float', example: -6.2088),
                    new OA\Property(property: 'longitude', type: 'number', format: 'float', example: 106.8456),
                    new OA\Property(property: 'platform_name', type: 'string', example: 'Zoom'),
                    new OA\Property(property: 'link', type: 'string', format: 'uri', example: 'https://zoom.us/j/123456'),
                    new OA\Property(property: 'start_datetime', type: 'string', format: 'date-time', example: '2026-07-15T09:00:00'),
                    new OA\Property(property: 'end_datetime', type: 'string', format: 'date-time', example: '2026-07-15T17:00:00'),
                    new OA\Property(property: 'capacity', type: 'integer', example: 100),
                    new OA\Property(property: 'poster', type: 'string', format: 'binary', description: 'Event poster image (max 5MB, jpeg/png/webp)'),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Event created successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Event created successfully'),
                new OA\Property(property: 'event', ref: '#/components/schemas/Event'),
            ]
        )
    )]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function store(Request $request)
    {
        $validated = $this->validateEvent($request);
        
        $event = new Event($validated);
        $event->user_id = $request->user()->id;
        
        if ($request->hasFile('poster')) {
            $event->poster = $request->file('poster')->store('posters', 'local');
        }

        $event->save();

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event
        ], 201);
    }

    #[OA\Post(
        path: '/api/organizer/events/{event}',
        summary: 'Update an existing event',
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
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'title', type: 'string', maxLength: 255, example: 'Updated Festival Name'),
                    new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 1),
                    new OA\Property(property: 'description', type: 'string', example: 'Updated description'),
                    new OA\Property(property: 'type', type: 'string', enum: ['online', 'offline'], example: 'online'),
                    new OA\Property(property: 'platform_name', type: 'string', example: 'Google Meet'),
                    new OA\Property(property: 'link', type: 'string', format: 'uri', example: 'https://meet.google.com/abc-defg-hij'),
                    new OA\Property(property: 'start_datetime', type: 'string', format: 'date-time', example: '2026-08-01T10:00:00'),
                    new OA\Property(property: 'end_datetime', type: 'string', format: 'date-time', example: '2026-08-01T18:00:00'),
                    new OA\Property(property: 'capacity', type: 'integer', example: 150),
                    new OA\Property(property: 'poster', type: 'string', format: 'binary', description: 'New poster image (optional)'),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Event updated successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Event updated successfully'),
                new OA\Property(property: 'event', ref: '#/components/schemas/Event'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    public function update(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
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

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event
        ]);
    }

    #[OA\Delete(
        path: '/api/organizer/events/{event}',
        summary: 'Delete an event (owner or admin)',
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
    #[OA\Response(
        response: 200,
        description: 'Event deleted',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Event deleted successfully'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden')]
    public function destroy(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($event->getRawOriginal('poster') && Storage::disk('local')->exists($event->getRawOriginal('poster'))) {
            Storage::disk('local')->delete($event->getRawOriginal('poster'));
        }

        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully'
        ]);
    }

    #[OA\Get(
        path: '/api/organizer/events/{event}/attendees',
        summary: 'Get attendees list for an event',
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
    #[OA\Response(
        response: 200,
        description: 'Attendees list',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'event', ref: '#/components/schemas/Event'),
                new OA\Property(property: 'attendees', type: 'object'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    public function attendees(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $attendees = $event->eventRegistrations()
            ->with(['user:id,name,email,avatar_url'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'event' => $event,
            'attendees' => $attendees
        ]);
    }
}
