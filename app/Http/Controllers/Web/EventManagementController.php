<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Mail\EventRefundedMail;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Services\NotificationDispatchService;
use App\Services\ReverseGeocodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class EventManagementController extends Controller
{
    private function validateEvent(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'required|string',
            'price' => 'nullable|integer|min:0',
            'type' => 'required|in:online,offline',

            // Rules for offline
            'location_name' => 'required_if:type,offline|nullable|string|max:255',
            'address' => 'required_if:type,offline|nullable|string',
            'city' => 'nullable|string|max:255',
            'latitude' => 'required_if:type,offline|nullable|numeric|between:-90,90',
            'longitude' => 'required_if:type,offline|nullable|numeric|between:-180,180',

            // Rules for online
            'platform_name' => 'required_if:type,online|nullable|string|max:255',
            'link' => 'required_if:type,online|nullable|url|max:255',

            'start_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'capacity' => 'nullable|integer|min:1',

            // Poster validation: only required on create; max 5MB
            'poster' => ($request->isMethod('put') || $request->isMethod('patch') || $request->route('event') ? 'nullable' : 'required').'|image|mimes:jpeg,png,jpg,webp|max:5120',
        ], [
            'title.required' => 'Judul event wajib diisi.',
            'title.max' => 'Judul event tidak boleh lebih dari 255 karakter.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'description.required' => 'Deskripsi event wajib diisi.',
            'price.integer' => 'Harga tiket harus berupa angka.',
            'price.min' => 'Harga tiket minimal Rp 0.',
            'type.required' => 'Tipe event wajib dipilih.',
            'type.in' => 'Tipe event harus online atau offline.',
            'location_name.required_if' => 'Nama lokasi wajib diisi untuk event offline.',
            'address.required_if' => 'Alamat lengkap wajib diisi untuk event offline.',
            'latitude.required_if' => 'Titik koordinat latitude wajib diisi untuk event offline.',
            'longitude.required_if' => 'Titik koordinat longitude wajib diisi untuk event offline.',
            'platform_name.required_if' => 'Platform webinar wajib diisi untuk event online.',
            'link.required_if' => 'Link webinar wajib diisi untuk event online.',
            'link.url' => 'Format link webinar tidak valid (harus diawali dengan http:// atau https://).',
            'start_date.required' => 'Tanggal event wajib diisi.',
            'start_date.date' => 'Format tanggal tidak valid.',
            'start_time.required' => 'Waktu mulai event wajib diisi.',
            'start_time.date_format' => 'Format waktu mulai tidak valid.',
            'end_time.required' => 'Waktu selesai event wajib diisi.',
            'end_time.date_format' => 'Format waktu selesai tidak valid.',
            'capacity.integer' => 'Kuota peserta harus berupa angka.',
            'capacity.min' => 'Kuota peserta minimal 1.',
            'poster.required' => 'Poster event wajib diunggah.',
            'poster.image' => 'Poster harus berupa file gambar.',
            'poster.mimes' => 'Format gambar poster harus jpeg, png, jpg, atau webp.',
            'poster.max' => 'Ukuran file poster tidak boleh lebih dari 5MB.',
        ]);

        $start_datetime_str = $validated['start_date'].' '.$validated['start_time'];
        $end_datetime_str = $validated['start_date'].' '.$validated['end_time'];

        $start_datetime = Carbon::parse($start_datetime_str);
        $end_datetime = Carbon::parse($end_datetime_str);

        if ($end_datetime->lte($start_datetime)) {
            throw ValidationException::withMessages([
                'end_time' => ['Waktu selesai harus setelah waktu mulai.'],
            ]);
        }

        unset($validated['start_date']);
        unset($validated['start_time']);
        unset($validated['end_time']);

        $validated['start_datetime'] = $start_datetime->toDateTimeString();
        $validated['end_datetime'] = $end_datetime->toDateTimeString();

        return $validated;
    }

    private function resolveCityIfNeeded(array &$validated): void
    {
        if (($validated['type'] ?? null) === 'offline' && empty($validated['city'])) {
            $latitude = $validated['latitude'] ?? null;
            $longitude = $validated['longitude'] ?? null;

            if ($latitude !== null && $longitude !== null) {
                $city = app(ReverseGeocodeService::class)->resolveCity(
                    (float) $latitude,
                    (float) $longitude
                );

                if ($city !== null) {
                    $validated['city'] = $city;
                }
            }
        }

        if (($validated['type'] ?? null) === 'online') {
            $validated['city'] = null;
        }
    }

    public function create()
    {
        if (! auth()->user()->email_verified_at) {
            return redirect()->route('profile.edit')->with('error', 'Anda harus memverifikasi email untuk membuat event.');
        }

        $categories = Category::all();

        return Inertia::render('Event/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        if (! $request->user()->email_verified_at) {
            return redirect()->route('profile.edit')->with('error', 'Anda harus memverifikasi email untuk membuat event.');
        }

        $validated = $this->validateEvent($request);
        $this->resolveCityIfNeeded($validated);

        $event = new Event($validated);
        $event->user_id = $request->user()->id;

        if ($request->hasFile('poster')) {
            $event->poster = $request->file('poster')->store('posters', 'local');
        }

        $event->save();

        return redirect()->route('dashboard')->with('success', 'Event created successfully.');
    }

    public function edit(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($event->start_datetime->isPast()) {
            return redirect()->back()->with('error', 'Cannot edit an event that has already started.');
        }

        $categories = Category::all();

        return Inertia::render('Event/Edit', [
            'event' => $event,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($event->start_datetime->isPast()) {
            return redirect()->back()->with('error', 'Cannot update an event that has already started.');
        }

        $validated = $this->validateEvent($request);
        $this->resolveCityIfNeeded($validated);

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
            $event->city = null;
            $event->latitude = null;
            $event->longitude = null;
        } else {
            $event->platform_name = null;
            $event->link = null;
        }

        $event->save();

        return redirect()->route('dashboard')->with('success', 'Event updated successfully.');
    }

    public function destroy(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id && ! in_array($request->user()->role, ['admin', 'super_admin'])) {
            abort(403);
        }

        if ($event->start_datetime->isPast()) {
            return redirect()->back()->with('error', 'Cannot delete an event that has already started.');
        }

        if ($event->getRawOriginal('poster') && Storage::disk('local')->exists($event->getRawOriginal('poster'))) {
            Storage::disk('local')->delete($event->getRawOriginal('poster'));
        }

        if ($event->getRawOriginal('certificate_template') && Storage::disk('local')->exists($event->getRawOriginal('certificate_template'))) {
            Storage::disk('local')->delete($event->getRawOriginal('certificate_template'));
        }

        $event->delete();

        return redirect()->route('dashboard')->with('success', 'Event deleted successfully.');
    }

    public function cancel(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($event->start_datetime->isPast()) {
            return redirect()->back()->with('error', 'Cannot cancel an event that has already started.');
        }

        if ($event->status === 'cancelled') {
            return redirect()->back()->with('error', 'Event is already cancelled.');
        }

        $event->update(['status' => 'cancelled']);

        $registrations = $event->eventRegistrations()->with('user')->get();
        $notifications = app(NotificationDispatchService::class);

        foreach ($registrations as $registration) {
            if ($registration->user) {
                $notifications->dispatch(
                    recipient: $registration->user,
                    category: 'event_cancelled',
                    title: 'Event Dibatalkan',
                    body: "Event {$event->title} telah dibatalkan oleh penyelenggara.",
                    target: 'event_detail',
                    event: $event,
                );

                if ($event->price > 0) {
                    Mail::to($registration->user->email)->send(new EventRefundedMail($event, $registration->user));
                }
            }
            $registration->update(['status' => 'cancelled']);
        }

        return redirect()->back()->with('success', 'Event cancelled successfully, and participants have been notified.');
    }

    public function show(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        $event->load('category', 'user');
        $totalAttendees = $event->eventRegistrations()->count();
        $checkedInAttendees = $event->eventRegistrations()->whereNotNull('checked_in_at')->count();
        $remainingCapacity = $event->capacity ? ($event->capacity - $totalAttendees) : null;

        return Inertia::render('Event/EventDetail', [
            'event' => $event,
            'total_attendees' => $totalAttendees,
            'checked_in_attendees' => $checkedInAttendees,
            'remaining_capacity' => $remainingCapacity,
        ]);
    }

    public function kickAttendee(Request $request, Event $event, EventRegistration $registration)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($event->end_datetime->isPast()) {
            return redirect()->back()->with('error', 'Cannot kick attendees from a finished event.');
        }

        if ($registration->event_id !== $event->id) {
            abort(404);
        }

        $registration->delete();

        return redirect()->back()->with('success', 'Peserta berhasil dikeluarkan dari event.');
    }

    public function attendees(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        $query = $event->eventRegistrations()
            ->with(['user:id,name,email,avatar_url'])
            ->latest();

        if ($request->has('search') && ! empty($request->input('search'))) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        $attendees = $query->paginate(15)->withQueryString();

        return Inertia::render('Event/host/Attendees', [
            'event' => $event,
            'attendees' => $attendees,
            'filters' => $request->only(['search']),
        ]);
    }
}
