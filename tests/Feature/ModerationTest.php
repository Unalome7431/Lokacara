<?php

use App\Mail\EventBannedMail;
use App\Mail\EventCancelledForParticipantMail;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\EventReport;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->category = Category::factory()->create();
    $this->host = User::factory()->create(['role' => 'user']);
    $this->attendee = User::factory()->create(['role' => 'user']);
    $this->event = Event::factory()->create([
        'user_id' => $this->host->id,
        'category_id' => $this->category->id,
        'status' => 'active',
        'price' => 0,
    ]);
});

test('user can report an event with reason and description', function () {
    $response = $this->actingAs($this->attendee)
        ->post(route('events.report', $this->event), [
            'reason' => 'Penipuan / Scam',
            'description' => 'Ini adalah event scam yang merugikan.',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('event_reports', [
        'event_id' => $this->event->id,
        'reporter_id' => $this->attendee->id,
        'reason' => 'Penipuan / Scam',
        'description' => 'Ini adalah event scam yang merugikan.',
        'status' => 'pending',
    ]);
});

test('user cannot report event without reason or description', function () {
    $response = $this->actingAs($this->attendee)
        ->post(route('events.report', $this->event), [
            'reason' => '',
            'description' => '',
        ]);

    $response->assertSessionHasErrors(['reason', 'description']);
});

test('user cannot report same event twice if a pending report exists', function () {
    EventReport::create([
        'event_id' => $this->event->id,
        'reporter_id' => $this->attendee->id,
        'reason' => 'Spam',
        'description' => 'Laporan pertama.',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->attendee)
        ->post(route('events.report', $this->event), [
            'reason' => 'Spam',
            'description' => 'Laporan kedua.',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', 'You already have a pending report for this event.');
    
    // Ensure only one report exists
    expect(EventReport::where('event_id', $this->event->id)->count())->toBe(1);
});

test('guest cannot report event', function () {
    $response = $this->post(route('events.report', $this->event), [
        'reason' => 'Spam',
        'description' => 'Mencoba melaporkan.',
    ]);

    $response->assertRedirect(route('login'));
});

test('admin can access dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));
    $response->assertStatus(200);
});

test('non-admin user cannot access admin dashboard', function () {
    $response = $this->actingAs($this->attendee)->get(route('admin.dashboard'));
    $response->assertStatus(403);
});

test('admin can dismiss report', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $report = EventReport::create([
        'event_id' => $this->event->id,
        'reporter_id' => $this->attendee->id,
        'reason' => 'Spam',
        'description' => 'Laporan test.',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.reports.dismiss', $report));

    $response->assertRedirect();
    $response->assertSessionHas('success');
    expect($report->fresh()->status)->toBe('resolved');
    expect($report->fresh()->resolved_by)->toBe($admin->id);
});

test('admin can ban event', function () {
    Mail::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    
    $registration = EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $this->attendee->id,
        'status' => 'confirmed',
        'qr_token' => 'qr_token_banned_test',
    ]);

    $report = EventReport::create([
        'event_id' => $this->event->id,
        'reporter_id' => $this->attendee->id,
        'reason' => 'Spam',
        'description' => 'Laporan test.',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.events.ban', $this->event));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($this->event->fresh()->status)->toBe('banned');
    expect($registration->fresh()->status)->toBe('cancelled');
    expect($report->fresh()->status)->toBe('resolved');
    expect($report->fresh()->resolved_by)->toBe($admin->id);

    Mail::assertSent(EventBannedMail::class, function ($mail) {
        return $mail->event->id === $this->event->id;
    });

    Mail::assertSent(EventCancelledForParticipantMail::class, function ($mail) {
        return $mail->event->id === $this->event->id && $mail->user->id === $this->attendee->id;
    });
});
