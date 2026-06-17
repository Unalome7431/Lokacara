<?php

use App\Jobs\SendNotificationEmailJob;
use App\Mail\EventRefundedMail;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    $this->category = Category::factory()->create();
    $this->host = User::factory()->create();
    $this->attendee = User::factory()->create();
    $this->event = Event::factory()->create([
        'user_id' => $this->host->id,
        'category_id' => $this->category->id,
        'price' => 0,
        'status' => 'active',
    ]);
});

test('host can cancel their own event via web', function () {
    Queue::fake();
    Mail::fake();

    // Create registration
    $registration = EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $this->attendee->id,
        'status' => 'confirmed',
        'qr_token' => 'qr_token_test',
    ]);

    $response = $this->actingAs($this->host)
        ->post(route('dashboard.events.cancel', $this->event));

    $response->assertRedirect();

    // Assert event is cancelled
    expect($this->event->fresh()->status)->toBe('cancelled');

    // Assert registration is cancelled
    expect($registration->fresh()->status)->toBe('cancelled');

    // Assert notification email was queued
    Queue::assertPushed(SendNotificationEmailJob::class, function ($job) {
        return $job->recipient->id === $this->attendee->id &&
               $job->category === 'event_cancelled';
    });

    // Since price is 0, refund email should NOT be sent
    Mail::assertNotSent(EventRefundedMail::class);
});

test('host gets refund email sent to attendees for paid events', function () {
    Queue::fake();
    Mail::fake();

    $paidEvent = Event::factory()->create([
        'user_id' => $this->host->id,
        'category_id' => $this->category->id,
        'price' => 100000,
        'status' => 'active',
    ]);

    $registration = EventRegistration::create([
        'event_id' => $paidEvent->id,
        'user_id' => $this->attendee->id,
        'status' => 'confirmed',
        'qr_token' => 'qr_token_paid',
    ]);

    $response = $this->actingAs($this->host)
        ->post(route('dashboard.events.cancel', $paidEvent));

    $response->assertRedirect();

    expect($paidEvent->fresh()->status)->toBe('cancelled');
    expect($registration->fresh()->status)->toBe('cancelled');

    // Verify refund email was sent
    Mail::assertSent(EventRefundedMail::class, function ($mail) use ($paidEvent) {
        return $mail->user->id === $this->attendee->id &&
               $mail->event->id === $paidEvent->id;
    });
});

test('non-host cannot cancel event', function () {
    $otherUser = User::factory()->create();

    $response = $this->actingAs($otherUser)
        ->post(route('dashboard.events.cancel', $this->event));

    $response->assertStatus(403);
    expect($this->event->fresh()->status)->toBe('active');
});

test('cannot register to cancelled event', function () {
    $this->event->update(['status' => 'cancelled']);

    $response = $this->actingAs($this->attendee)
        ->post(route('events.join', $this->event));

    $response->assertRedirect();
    $response->assertSessionHas('error');

    // Registration should not exist
    expect(EventRegistration::where('event_id', $this->event->id)->where('user_id', $this->attendee->id)->exists())->toBeFalse();
});

test('cannot scan ticket for cancelled event', function () {
    $registration = EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $this->attendee->id,
        'status' => 'confirmed',
        'qr_token' => 'qr_token_test',
    ]);

    $this->event->update(['status' => 'cancelled']);

    $response = $this->actingAs($this->host)
        ->post(route('dashboard.events.attendance.scan', $this->event), [
            'qr_token' => 'qr_token_test',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect($registration->fresh()->checked_in_at)->toBeNull();
});

test('cancelled events are hidden from discovery home and search', function () {
    // Make sure we have future start datetime so they would show up if active
    $this->event->update([
        'status' => 'cancelled',
        'start_datetime' => now()->addDays(5),
    ]);

    // Check web home page
    $responseWebHome = $this->get(route('home'));
    $responseWebHome->assertStatus(200);
    $eventsHome = $responseWebHome->original->getData()['page']['props']['events'];
    $eventsHomeIds = collect($eventsHome)->pluck('id');
    expect($eventsHomeIds)->not->toContain($this->event->id);

    // Check web search page
    $responseWebSearch = $this->get(route('events.search', ['keyword' => $this->event->title]));
    $responseWebSearch->assertStatus(200);
    $eventsSearch = $responseWebSearch->original->getData()['page']['props']['events']['data'];
    $eventsSearchIds = collect($eventsSearch)->pluck('id');
    expect($eventsSearchIds)->not->toContain($this->event->id);

    // Check API feed page
    $this->event->update(['view_count' => 100]); // Minimum 50 view_count requirement for API feed
    $responseApiFeed = $this->getJson('/api/events/feed');
    $responseApiFeed->assertStatus(200);
    $eventsApiFeed = $responseApiFeed->json()['data'];
    $eventsApiFeedIds = collect($eventsApiFeed)->pluck('id');
    expect($eventsApiFeedIds)->not->toContain($this->event->id);

    // Check API search page
    $responseApiSearch = $this->getJson('/api/events/search?keyword='.urlencode($this->event->title));
    $responseApiSearch->assertStatus(200);
    $eventsApiSearch = $responseApiSearch->json()['data'];
    $eventsApiSearchIds = collect($eventsApiSearch)->pluck('id');
    expect($eventsApiSearchIds)->not->toContain($this->event->id);
});
