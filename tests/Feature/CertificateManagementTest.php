<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\User;
use App\Jobs\DistributeCertificatesJob;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

beforeEach(function () {
    Storage::fake('local');
    $this->user = User::factory()->create();
    $this->category = Category::factory()->create();
    
    // Create an event owned by the user
    $this->event = Event::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'start_datetime' => Carbon::now()->subDays(2),
        'end_datetime' => Carbon::now()->subDay(), // already done
    ]);
});

test('guests are redirected to the login page from certificate config', function () {
    $response = $this->get(route('dashboard.events.certificates.index', $this->event));
    $response->assertRedirect(route('login'));
});

test('authenticated non-owners cannot access certificate config page', function () {
    $otherUser = User::factory()->create();
    $this->actingAs($otherUser);

    $response = $this->get(route('dashboard.events.certificates.index', $this->event));
    $response->assertStatus(403);
});

test('authenticated owners can access certificate config page', function () {
    $this->actingAs($this->user);

    $response = $this->get(route('dashboard.events.certificates.index', $this->event));
    $response->assertOk();
    $response->assertSee($this->event->title);
});

test('owner can save certificate layout configuration without template file', function () {
    $this->actingAs($this->user);

    $response = $this->post(route('dashboard.events.certificates.save', $this->event), [
        'font_family' => 'Playfair',
        'font_color' => '#FF0000',
        'font_size' => 'Large',
        'x_pos' => 45.5,
        'is_x_center' => false,
        'y_pos' => 60.0,
        'is_y_center' => false,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->event->refresh();
    expect($this->event->certificate_font_family)->toBe('Playfair')
        ->and($this->event->certificate_font_color)->toBe('#FF0000')
        ->and($this->event->certificate_font_size)->toBe('Large')
        ->and($this->event->certificate_x_pos)->toBe(45.5)
        ->and($this->event->certificate_is_x_center)->toBeFalse()
        ->and($this->event->certificate_y_pos)->toBe(60.0)
        ->and($this->event->certificate_is_y_center)->toBeFalse();
});

test('owner can upload certificate template file and it is saved', function () {
    $this->actingAs($this->user);

    $file = UploadedFile::fake()->image('template.jpg', 800, 600);

    $response = $this->post(route('dashboard.events.certificates.save', $this->event), [
        'template' => $file,
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertRedirect();
    
    $this->event->refresh();
    expect($this->event->certificate_template)->not->toBeNull();
    Storage::disk('local')->assertExists($this->event->certificate_template);
});

test('owner cannot distribute certificates if event is not finished yet', function () {
    $this->actingAs($this->user);

    // Set event end time to future
    $this->event->update([
        'end_datetime' => Carbon::now()->addDays(2),
    ]);

    $response = $this->post(route('dashboard.events.certificates.distribute', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', 'Sertifikat tidak dapat didistribusikan sebelum event selesai.');
});

test('owner cannot distribute certificates if no template is uploaded', function () {
    $this->actingAs($this->user);

    // Event is done, but no template
    $response = $this->post(route('dashboard.events.certificates.distribute', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['template']);
});

test('owner cannot distribute certificates if no attendees checked in', function () {
    $this->actingAs($this->user);

    // Upload template first
    $file = UploadedFile::fake()->image('template.jpg');
    $path = Storage::disk('local')->putFile('templates', $file);
    $this->event->update(['certificate_template' => $path]);

    // No registrations at all, or only registered but not present
    $attendee = User::factory()->create();
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'registered', // not present
        'qr_token' => 'dummy',
    ]);

    $response = $this->post(route('dashboard.events.certificates.distribute', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error', 'Tidak ada peserta yang terdata hadir (checked-in) untuk menerima sertifikat.');
});

test('owner can distribute certificates when event is done and attendees checked in', function () {
    Queue::fake();
    $this->actingAs($this->user);

    // Set template
    $file = UploadedFile::fake()->image('template.jpg');
    $path = Storage::disk('local')->putFile('templates', $file);
    $this->event->update(['certificate_template' => $path]);

    // Checked-in attendee
    $attendee = User::factory()->create();
    EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    $response = $this->post(route('dashboard.events.certificates.distribute', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'E-Sertifikat sedang diproses dan didistribusikan ke peserta yang hadir.');

    Queue::assertPushed(DistributeCertificatesJob::class, function ($job) {
        return $job->event->id === $this->event->id &&
               $job->config['font_family'] === 'Roboto' &&
               Storage::disk('local')->exists($job->templatePath);
    });
});

test('owner can download certificate template if exists', function () {
    $this->actingAs($this->user);

    $file = UploadedFile::fake()->image('template.jpg');
    $path = Storage::disk('local')->putFile('templates', $file);
    $this->event->update(['certificate_template' => $path]);

    $response = $this->get(route('dashboard.events.certificates.template', $this->event));
    $response->assertOk();
    
    // Non-owner gets 403
    $otherUser = User::factory()->create();
    $this->actingAs($otherUser);
    $response = $this->get(route('dashboard.events.certificates.template', $this->event));
    $response->assertStatus(403);
});
