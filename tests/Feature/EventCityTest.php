<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->category = Category::factory()->create();
});

test('offline event store auto-detects city from coordinates', function () {
    $this->actingAs($this->user, 'sanctum');

    $file = UploadedFile::fake()->image('poster.jpg');
    $response = $this->postJson('/api/organizer/events', [
        'title' => 'Seminar Kota',
        'description' => 'Deskripsi seminar',
        'type' => 'offline',
        'location_name' => 'Gedung Utama',
        'address' => 'Jl. Slamet Riyadi No. 123, Kota Surakarta',
        'latitude' => -7.5667,
        'longitude' => 110.8167,
        'start_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
        'poster' => $file,
    ]);

    $response->assertStatus(201);
    expect(Event::first()->city)->not->toBeNull();
});

test('offline event update auto-detects city from coordinates', function () {
    $this->actingAs($this->user, 'sanctum');

    $event = Event::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'type' => 'offline',
        'start_datetime' => Carbon::now()->addDays(10),
        'end_datetime' => Carbon::now()->addDays(10)->addHours(8),
    ]);

    $response = $this->postJson("/api/organizer/events/{$event->id}", [
        'title' => 'Updated Seminar',
        'description' => 'Updated description',
        'type' => 'offline',
        'location_name' => 'New Venue',
        'address' => 'Jl. Baru No. 456',
        'latitude' => -7.5667,
        'longitude' => 110.8167,
        'start_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $response->assertOk();
    $event->refresh();
    expect($event->city)->not->toBeNull();
});

test('manual city input is normalized (trimmed) on store', function () {
    $this->actingAs($this->user, 'sanctum');

    $file = UploadedFile::fake()->image('poster.jpg');
    $response = $this->postJson('/api/organizer/events', [
        'title' => 'Seminar Trim',
        'description' => 'Desc',
        'type' => 'offline',
        'location_name' => 'Venue',
        'address' => 'Addr',
        'city' => '  Surakarta  ',
        'latitude' => -7.5667,
        'longitude' => 110.8167,
        'start_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
        'poster' => $file,
    ]);

    $response->assertStatus(201);
    expect(Event::first()->city)->toBe('Surakarta');
});

test('online event store clears city', function () {
    $this->actingAs($this->user, 'sanctum');

    $response = $this->postJson('/api/organizer/events', [
        'title' => 'Webinar Online',
        'description' => 'Online event description',
        'type' => 'online',
        'platform_name' => 'Zoom',
        'link' => 'https://zoom.us/j/123456',
        'city' => 'Surakarta',
        'start_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $response->assertStatus(422); // poster required

    $file = UploadedFile::fake()->image('poster.jpg');
    $response = $this->postJson('/api/organizer/events', [
        'title' => 'Webinar Online',
        'description' => 'Online event description',
        'type' => 'online',
        'platform_name' => 'Zoom',
        'link' => 'https://zoom.us/j/123456',
        'city' => 'Surakarta',
        'start_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
        'poster' => $file,
    ]);

    $response->assertStatus(201);

    $event = Event::first();
    expect($event->city)->toBeNull();
});

test('switching type to online clears city on update', function () {
    $this->actingAs($this->user, 'sanctum');

    $event = Event::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'type' => 'offline',
        'city' => 'Surakarta',
        'start_datetime' => Carbon::now()->addDays(10),
        'end_datetime' => Carbon::now()->addDays(10)->addHours(8),
    ]);

    $response = $this->postJson("/api/organizer/events/{$event->id}", [
        'title' => 'Now Online',
        'description' => 'Desc',
        'type' => 'online',
        'platform_name' => 'Zoom',
        'link' => 'https://zoom.us/j/123',
        'start_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $response->assertOk();
    $event->refresh();
    expect($event->city)->toBeNull();
});

test('location filter returns exact city matches only', function () {
    $eventSurakarta = Event::factory()->create([
        'type' => 'offline',
        'city' => 'Surakarta',
        'status' => 'active',
        'start_datetime' => Carbon::now()->addDays(5),
    ]);
    $eventJakarta = Event::factory()->create([
        'type' => 'offline',
        'city' => 'Jakarta',
        'status' => 'active',
        'start_datetime' => Carbon::now()->addDays(5),
    ]);

    $response = $this->getJson('/api/events/search?location=Surakarta');

    $response->assertOk()
        ->assertJsonPath('data.0.id', $eventSurakarta->id)
        ->assertJsonPath('total', 1);
});

test('location filter is case-insensitive', function () {
    $event = Event::factory()->create([
        'type' => 'offline',
        'city' => 'Surakarta',
        'status' => 'active',
        'start_datetime' => Carbon::now()->addDays(5),
    ]);

    $response = $this->getJson('/api/events/search?location=surakarta');
    $response->assertOk()
        ->assertJsonPath('data.0.id', $event->id)
        ->assertJsonPath('total', 1);
});

test('venue text containing city name does not produce false positive', function () {
    Event::factory()->create([
        'type' => 'offline',
        'city' => 'Jakarta',
        'location_name' => 'Surakarta Hall',
        'address' => 'Jl. Surakarta Baru No. 1',
        'status' => 'active',
        'start_datetime' => Carbon::now()->addDays(5),
    ]);

    $response = $this->getJson('/api/events/search?location=Surakarta');

    $response->assertOk()
        ->assertJsonPath('total', 0);
});

test('legacy events with null city are excluded from location filter', function () {
    $eventWithCity = Event::factory()->create([
        'type' => 'offline',
        'city' => 'Surakarta',
        'status' => 'active',
        'start_datetime' => Carbon::now()->addDays(5),
    ]);
    Event::factory()->create([
        'type' => 'offline',
        'city' => null,
        'status' => 'active',
        'start_datetime' => Carbon::now()->addDays(5),
    ]);

    $response = $this->getJson('/api/events/search?location=Surakarta');

    $response->assertOk()
        ->assertJsonPath('data.0.id', $eventWithCity->id)
        ->assertJsonPath('total', 1);
});

test('location filter paginates across multiple pages', function () {
    $events = collect(range(1, 16))->map(function (int $index) {
        return Event::factory()->create([
            'type' => 'offline',
            'city' => 'Surakarta',
            'status' => 'active',
            'start_datetime' => Carbon::now()->addDays($index),
        ]);
    });

    $response = $this->getJson('/api/events/search?location=Surakarta&page=2');

    $response->assertOk()
        ->assertJsonPath('current_page', 2)
        ->assertJsonPath('per_page', 15)
        ->assertJsonPath('total', 16)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $events[15]->id);
});

test('backfill cities command updates resolvable offline event addresses', function () {
    $resolved = Event::factory()->create([
        'type' => 'offline',
        'city' => null,
        'address' => 'Jl. Slamet Riyadi No. 123, Kota Surakarta, Jawa Tengah',
        'status' => 'active',
        'start_datetime' => Carbon::now()->addDays(10),
    ]);
    $unresolved = Event::factory()->create([
        'type' => 'offline',
        'city' => null,
        'address' => 'Gedung Serbaguna Tanpa Kota',
        'status' => 'active',
        'start_datetime' => Carbon::now()->addDays(10),
    ]);

    Artisan::call('events:backfill-cities');

    $resolved->refresh();
    $unresolved->refresh();

    expect($resolved->city)->toBe('Surakarta')
        ->and($unresolved->city)->toBeNull();
});

test('offline event creates successfully without manual city', function () {
    $this->actingAs($this->user, 'sanctum');

    $file = UploadedFile::fake()->image('poster.jpg');
    $response = $this->postJson('/api/organizer/events', [
        'title' => 'Offline Event',
        'description' => 'Desc',
        'type' => 'offline',
        'location_name' => 'Venue',
        'address' => 'Address',
        'latitude' => -7.5,
        'longitude' => 110.8,
        'start_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
        'poster' => $file,
    ]);

    $response->assertStatus(201);
});
