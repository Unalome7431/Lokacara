<?php

use App\Models\Event;
use App\Models\Category;
use Carbon\Carbon;

test('guests can access the search endpoint and get default results', function () {
    $category = Category::factory()->create();
    Event::factory()->count(3)->create([
        'category_id' => $category->id,
        'start_datetime' => Carbon::tomorrow(),
    ]);

    $response = $this->get('/events/search');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Event/Search')
        ->has('events')
        ->has('categories')
        ->has('filters')
    );
});

test('can search events by case-insensitive keyword', function () {
    $event1 = Event::factory()->create(['title' => 'Seminar Laravel Hebat', 'start_datetime' => Carbon::tomorrow()]);
    $event2 = Event::factory()->create(['title' => 'Workshop React Keren', 'start_datetime' => Carbon::tomorrow()]);

    // Search for "laravel"
    $response = $this->get('/events/search?keyword=laravel');
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('filters.keyword', 'laravel')
        ->where('events.data.0.title', 'Seminar Laravel Hebat')
        ->has('events.data', 1)
    );

    // Search for "react"
    $response = $this->get('/events/search?keyword=REACT');
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('filters.keyword', 'REACT')
        ->where('events.data.0.title', 'Workshop React Keren')
        ->has('events.data', 1)
    );
});

test('can filter events by category', function () {
    $cat1 = Category::factory()->create();
    $cat2 = Category::factory()->create();

    $event1 = Event::factory()->create(['category_id' => $cat1->id, 'start_datetime' => Carbon::tomorrow()]);
    Event::factory()->create(['category_id' => $cat2->id, 'start_datetime' => Carbon::tomorrow()]);

    $response = $this->get("/events/search?category_id={$cat1->id}");
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('filters.category_id', $cat1->id)
        ->where('events.data.0.id', $event1->id)
        ->has('events.data', 1)
    );
});

test('can filter events by type (online/offline)', function () {
    $event1 = Event::factory()->create(['type' => 'online', 'start_datetime' => Carbon::tomorrow()]);
    $event2 = Event::factory()->create(['type' => 'offline', 'start_datetime' => Carbon::tomorrow()]);

    $response = $this->get('/events/search?type=online');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('filters.type', 'online')
        ->where('events.data.0.id', $event1->id)
        ->has('events.data', 1)
    );

    $response = $this->get('/events/search?type=offline');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('filters.type', 'offline')
        ->where('events.data.0.id', $event2->id)
        ->has('events.data', 1)
    );
});

test('can filter events by price range', function () {
    $event1 = Event::factory()->create(['price' => 10000, 'start_datetime' => Carbon::tomorrow()]);
    $event2 = Event::factory()->create(['price' => 50000, 'start_datetime' => Carbon::tomorrow()]);

    // min price filter
    $response = $this->get('/events/search?min_price=20000');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('events.data.0.id', $event2->id)
        ->has('events.data', 1)
    );

    // max price filter
    $response = $this->get('/events/search?max_price=20000');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('events.data.0.id', $event1->id)
        ->has('events.data', 1)
    );
});

test('can filter events by start and end date', function () {
    $event1 = Event::factory()->create(['start_datetime' => Carbon::tomorrow()]);
    Event::factory()->create(['start_datetime' => Carbon::tomorrow()->addDays(5)]);

    $startDateStr = Carbon::tomorrow()->format('Y-m-d');
    $endDateStr = Carbon::tomorrow()->addDays(2)->format('Y-m-d');

    $response = $this->get("/events/search?start_date={$startDateStr}&end_date={$endDateStr}");
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('events.data.0.id', $event1->id)
        ->has('events.data', 1)
    );
});

test('can sort events by price ascending and descending', function () {
    $event1 = Event::factory()->create(['price' => 10000, 'start_datetime' => Carbon::tomorrow()]);
    $event2 = Event::factory()->create(['price' => 50000, 'start_datetime' => Carbon::tomorrow()]);

    // Price Ascending
    $response = $this->get('/events/search?sort_by=price_asc');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('events.data.0.id', $event1->id)
        ->where('events.data.1.id', $event2->id)
    );

    // Price Descending
    $response = $this->get('/events/search?sort_by=price_desc');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('events.data.0.id', $event2->id)
        ->where('events.data.1.id', $event1->id)
    );
});

test('can sort events by nearest proximity coordinate (sqlite fallback)', function () {
    $event1 = Event::factory()->create([
        'type' => 'offline',
        'latitude' => -7.79600,
        'longitude' => 110.36900,
        'start_datetime' => Carbon::tomorrow()
    ]);
    
    $event2 = Event::factory()->create([
        'type' => 'offline',
        'latitude' => -7.89000,
        'longitude' => 110.45000,
        'start_datetime' => Carbon::tomorrow()
    ]);

    $response = $this->get('/events/search?sort_by=nearest&latitude=-7.79558&longitude=110.36949');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('events.data.0.id', $event1->id)
        ->where('events.data.1.id', $event2->id)
    );
});
