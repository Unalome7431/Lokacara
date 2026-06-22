<?php

use App\Models\Category;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    $this->user = User::factory()->create();
    $this->category = Category::factory()->create();

    $this->event = Event::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->subDays(2),
        'end_datetime' => Carbon::now()->subDay(),
    ]);
});

test('owner can read certificate state', function () {
    $this->actingAs($this->user, 'sanctum');

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertOk()
        ->assertJsonStructure([
            'event',
            'is_eligible',
            'has_template',
            'issued_count',
            'last_issued_at',
            'status',
            'layout' => [
                'font_family', 'font_color', 'font_size',
                'x_pos', 'is_x_center', 'y_pos', 'is_y_center',
                'max_width', 'max_height',
            ],
        ]);
});

test('non-owner cannot read certificate state', function () {
    $otherUser = User::factory()->create();
    $this->actingAs($otherUser, 'sanctum');

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertStatus(403);
});

test('state reflects not_configured when no template or layout saved', function () {
    $this->actingAs($this->user, 'sanctum');

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertOk()
        ->assertJsonPath('status', 'not_configured')
        ->assertJsonPath('has_template', false);
});

test('state remains not_configured when template is missing but layout exists', function () {
    $this->actingAs($this->user, 'sanctum');

    $this->event->update([
        'certificate_font_family' => 'Roboto',
        'certificate_font_color' => '#000000',
        'certificate_font_size' => 'Medium',
    ]);

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertOk()
        ->assertJsonPath('status', 'not_configured')
        ->assertJsonPath('has_template', false);
});

test('state reflects ready when template saved and not yet distributed', function () {
    $this->actingAs($this->user, 'sanctum');

    $file = UploadedFile::fake()->image('template.jpg');
    $path = $file->store('event-templates/'.$this->event->id, 'local');
    $this->event->update([
        'certificate_template' => $path,
        'certificate_font_family' => 'Roboto',
        'certificate_font_color' => '#000000',
        'certificate_font_size' => 'Medium',
    ]);

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertOk()
        ->assertJsonPath('status', 'ready')
        ->assertJsonPath('has_template', true);
});

test('state reflects distributed after issuing certificates', function () {
    $this->actingAs($this->user, 'sanctum');

    $file = UploadedFile::fake()->image('template.jpg');
    $path = $file->store('event-templates/'.$this->event->id, 'local');
    $this->event->update([
        'certificate_template' => $path,
        'certificate_font_family' => 'Roboto',
        'certificate_font_color' => '#000000',
        'certificate_font_size' => 'Medium',
    ]);

    $attendee = User::factory()->create(['name' => 'Jane Doe']);
    $registration = EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);
    Certificate::create([
        'registration_id' => $registration->id,
        'file_url' => 'certificates/dummy.jpg',
        'issued_at' => now(),
    ]);

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertOk()
        ->assertJsonPath('status', 'distributed')
        ->assertJsonPath('issued_count', 1)
        ->assertJsonPath('last_issued_at', fn ($val) => $val !== null);
});

test('state includes eligibility information', function () {
    $this->actingAs($this->user, 'sanctum');

    $attendee = User::factory()->create(['name' => 'Jane Doe']);
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertOk()
        ->assertJsonPath('is_eligible', true);
});

test('event not yet started is not eligible', function () {
    $this->actingAs($this->user, 'sanctum');

    $this->event->update([
        'start_datetime' => Carbon::now()->addDays(1),
        'end_datetime' => Carbon::now()->addDays(2),
    ]);

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertOk()
        ->assertJsonPath('is_eligible', false);
});

test('event is not eligible until it has ended', function () {
    $this->actingAs($this->user, 'sanctum');

    $this->event->update([
        'start_datetime' => Carbon::now()->subHours(2),
        'end_datetime' => Carbon::now()->addHour(),
    ]);

    $attendee = User::factory()->create(['name' => 'Jane Doe']);
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates");

    $response->assertOk()
        ->assertJsonPath('is_eligible', false);
});

test('owner can stream template', function () {
    $this->actingAs($this->user, 'sanctum');

    Storage::disk('local')->put('event-templates/'.$this->event->id.'/template.jpg', 'fake-image-content');
    $this->event->update(['certificate_template' => 'event-templates/'.$this->event->id.'/template.jpg']);

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates/template/stream");

    $response->assertOk();
});

test('non-owner cannot stream template', function () {
    $otherUser = User::factory()->create();
    $this->actingAs($otherUser, 'sanctum');

    Storage::disk('local')->put('event-templates/'.$this->event->id.'/template.jpg', 'fake');
    $this->event->update(['certificate_template' => 'event-templates/'.$this->event->id.'/template.jpg']);

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates/template/stream");

    $response->assertStatus(403);
});

test('template stream returns 404 when no template', function () {
    $this->actingAs($this->user, 'sanctum');

    $response = $this->getJson("/api/organizer/events/{$this->event->id}/certificates/template/stream");

    $response->assertStatus(404);
});

test('upload stores template in event-owned path and updates model', function () {
    $this->actingAs($this->user, 'sanctum');

    $file = UploadedFile::fake()->image('template.jpg');

    $response = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/template", [
        'template' => $file,
    ]);

    $response->assertOk();

    $this->event->refresh();
    expect($this->event->certificate_template)->not->toBeNull();
    Storage::disk('local')->assertExists($this->event->certificate_template);
});

test('upload replaces previous template and cleans old file', function () {
    $this->actingAs($this->user, 'sanctum');

    $firstFile = UploadedFile::fake()->image('first.jpg');
    $firstResponse = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/template", [
        'template' => $firstFile,
    ]);
    $firstResponse->assertOk();
    $this->event->refresh();
    $oldPath = $this->event->certificate_template;

    $secondFile = UploadedFile::fake()->image('second.jpg');
    $secondResponse = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/template", [
        'template' => $secondFile,
    ]);
    $secondResponse->assertOk();
    $this->event->refresh();

    expect($this->event->certificate_template)->not->toBe($oldPath);
    Storage::disk('local')->assertMissing($oldPath);
    Storage::disk('local')->assertExists($this->event->certificate_template);
});

test('upload fails for non-owner', function () {
    $otherUser = User::factory()->create();
    $this->actingAs($otherUser, 'sanctum');

    $file = UploadedFile::fake()->image('template.jpg');
    $response = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/template", [
        'template' => $file,
    ]);

    $response->assertStatus(403);
});

test('distribute persists layout fields to event', function () {
    Queue::fake();
    $this->actingAs($this->user, 'sanctum');

    $file = UploadedFile::fake()->image('template.jpg');
    $path = $file->store('event-templates/'.$this->event->id, 'local');
    $this->event->update(['certificate_template' => $path]);

    $attendee = User::factory()->create(['name' => 'Jane Doe']);
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    $response = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/distribute", [
        'template_path' => $path,
        'font_family' => 'Roboto',
        'font_color' => '#FF0000',
        'font_size' => 'Large',
        'x_pos' => 45.5,
        'is_x_center' => false,
        'y_pos' => 60,
        'is_y_center' => false,
    ]);

    $response->assertOk();

    $this->event->refresh();
    expect($this->event->certificate_font_family)->toBe('Roboto')
        ->and($this->event->certificate_font_color)->toBe('#FF0000')
        ->and($this->event->certificate_font_size)->toBe('Large')
        ->and($this->event->certificate_x_pos)->toBe(45.5)
        ->and($this->event->certificate_is_x_center)->toBeFalse()
        ->and($this->event->certificate_y_pos)->toBe(60.0)
        ->and($this->event->certificate_is_y_center)->toBeFalse();
});

test('distribute accepts legacy template path that matches event-owned template', function () {
    Queue::fake();
    $this->actingAs($this->user, 'sanctum');

    $path = 'event-templates/'.$this->event->id.'/template.jpg';
    Storage::disk('local')->put($path, 'fake');
    $this->event->update(['certificate_template' => $path]);

    $attendee = User::factory()->create(['name' => 'Jane Doe']);
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    $response = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/distribute", [
        'template_path' => $path,
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertOk();
});

test('distribute rejects unrelated template path', function () {
    $this->actingAs($this->user, 'sanctum');

    $path = 'event-templates/'.$this->event->id.'/template.jpg';
    Storage::disk('local')->put($path, 'fake');
    $this->event->update(['certificate_template' => $path]);

    $attendee = User::factory()->create(['name' => 'Jane Doe']);
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    $response = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/distribute", [
        'template_path' => 'some/random/path.jpg',
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertStatus(404);
});

test('distribute rejects template path owned by another event', function () {
    $this->actingAs($this->user, 'sanctum');

    $otherEvent = Event::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->subDays(2),
        'end_datetime' => Carbon::now()->subDay(),
    ]);

    $foreignPath = 'event-templates/'.$otherEvent->id.'/template.jpg';
    Storage::disk('local')->put($foreignPath, 'fake');
    $otherEvent->update(['certificate_template' => $foreignPath]);

    $attendee = User::factory()->create(['name' => 'Jane Doe']);
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    $response = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/distribute", [
        'template_path' => $foreignPath,
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertStatus(404);
});

test('template survives after distribution job', function () {
    Queue::fake();
    $this->actingAs($this->user, 'sanctum');

    $path = 'event-templates/'.$this->event->id.'/template.jpg';
    Storage::disk('local')->put($path, 'fake');
    $this->event->update([
        'certificate_template' => $path,
        'certificate_font_family' => 'Roboto',
        'certificate_font_color' => '#000000',
        'certificate_font_size' => 'Medium',
    ]);

    $attendee = User::factory()->create(['name' => 'Jane Doe']);
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    $response = $this->postJson("/api/organizer/events/{$this->event->id}/certificates/distribute", [
        'template_path' => $path,
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertOk();

    $this->event->refresh();
    expect($this->event->certificate_template)->not->toBeNull();
    Storage::disk('local')->assertExists($this->event->certificate_template);
});

test('deleting event cleans up certificate template directory', function () {
    $this->actingAs($this->user, 'sanctum');

    $futureEvent = Event::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->addDays(10),
        'end_datetime' => Carbon::now()->addDays(10)->addHours(8),
    ]);

    $templatePath = 'event-templates/'.$futureEvent->id.'/template.jpg';
    $siblingPath = 'event-templates/'.$futureEvent->id.'/keep.jpg';
    Storage::disk('local')->put($templatePath, 'fake');
    Storage::disk('local')->put($siblingPath, 'keep');
    $futureEvent->update(['certificate_template' => $templatePath]);

    $response = $this->deleteJson("/api/organizer/events/{$futureEvent->id}");

    $response->assertOk();
    Storage::disk('local')->assertMissing($templatePath);
    Storage::disk('local')->assertExists($siblingPath);
});
