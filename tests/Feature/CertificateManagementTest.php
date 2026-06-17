<?php

use App\Jobs\DistributeCertificatesJob;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

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
        'max_width' => 80.0,
        'max_height' => 20.0,
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
        ->and($this->event->certificate_is_y_center)->toBeFalse()
        ->and($this->event->certificate_max_width)->toBe(80.0)
        ->and($this->event->certificate_max_height)->toBe(20.0);
});

test('owner can save certificate layout configuration with template set to null string', function () {
    $this->actingAs($this->user);

    $response = $this->post(route('dashboard.events.certificates.save', $this->event), [
        'template' => 'null', // string "null" from JS FormData
        'font_family' => 'Playfair',
        'font_color' => '#FF0000',
        'font_size' => 'Large',
        'x_pos' => 45.5,
        'is_x_center' => false,
        'y_pos' => 60.0,
        'is_y_center' => false,
        'max_width' => 80.0,
        'max_height' => 20.0,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->event->refresh();
    expect($this->event->certificate_font_family)->toBe('Playfair');
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
        'max_width' => 80.0,
        'max_height' => 20.0,
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
        'max_width' => 80.0,
        'max_height' => 20.0,
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
        'max_width' => 80.0,
        'max_height' => 20.0,
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
        'max_width' => 80.0,
        'max_height' => 20.0,
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
        'max_width' => 80.0,
        'max_height' => 20.0,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'E-Sertifikat berhasil dibuat dan didistribusikan ke peserta yang hadir.');

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

test('attendee event detail page displays certificate download link if certificate distributed', function () {
    $attendee = User::factory()->create();
    $this->actingAs($attendee);

    // Register attendee and check-in
    $registration = EventRegistration::create([
        'event_id' => $this->event->id,
        'user_id' => $attendee->id,
        'status' => 'present',
        'qr_token' => 'dummy',
    ]);

    // View detail page before certificate is issued
    $response = $this->get(route('events.show', $this->event));
    $response->assertOk();
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Event/EventDetail')
        ->where('isRegistered', true)
        ->where('certificateUrl', null)
    );

    // Create certificate
    $certificate = Certificate::create([
        'registration_id' => $registration->id,
        'file_url' => 'certificates/dummy.jpg',
        'issued_at' => now(),
    ]);

    // View detail page after certificate is issued
    $response = $this->get(route('events.show', $this->event));
    $response->assertOk();
    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Event/EventDetail')
        ->where('isRegistered', true)
        ->where('certificateUrl', route('certificates.download', ['certificate' => $certificate->id]))
    );
});

test('owner cannot save certificate layout with invalid max_width or max_height bounds', function () {
    $this->actingAs($this->user);

    // Test width too small
    $response = $this->post(route('dashboard.events.certificates.save', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
        'max_width' => 5, // invalid (min: 10)
        'max_height' => 20,
    ]);
    $response->assertRedirect();
    $response->assertSessionHasErrors(['max_width']);

    // Test height too large
    $response = $this->post(route('dashboard.events.certificates.save', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000500',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
        'max_width' => 80,
        'max_height' => 120, // invalid (max: 100)
    ]);
    $response->assertRedirect();
    $response->assertSessionHasErrors(['max_height']);
});

test('guest cannot request certificate layout preview', function () {
    $response = $this->postJson(route('dashboard.events.certificates.preview', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
        'max_width' => 80,
        'max_height' => 20,
    ]);
    $response->assertStatus(401);
});

test('non-owner cannot request certificate layout preview', function () {
    $otherUser = User::factory()->create();
    $this->actingAs($otherUser);

    $response = $this->postJson(route('dashboard.events.certificates.preview', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
        'max_width' => 80,
        'max_height' => 20,
    ]);
    $response->assertStatus(403);
});

test('owner can download certificate preview with new template upload', function () {
    $this->actingAs($this->user);

    $file = UploadedFile::fake()->image('preview_template.jpg', 800, 600);

    $response = $this->post(route('dashboard.events.certificates.preview', $this->event), [
        'template' => $file,
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
        'max_width' => 80,
        'max_height' => 20,
    ]);

    $response->assertOk();
    $response->assertHeader('content-disposition', 'attachment; filename=preview_sertifikat.jpg');
});

test('owner can download certificate preview using saved database template', function () {
    $this->actingAs($this->user);

    $file = UploadedFile::fake()->image('database_template.png', 800, 600);
    $path = Storage::disk('local')->putFile('templates', $file);
    $this->event->update(['certificate_template' => $path]);

    $response = $this->post(route('dashboard.events.certificates.preview', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
        'max_width' => 80,
        'max_height' => 20,
    ]);

    $response->assertOk();
    $response->assertHeader('content-disposition', 'attachment; filename=preview_sertifikat.png');
});

test('owner gets validation error if preview has no template and database has no template', function () {
    $this->actingAs($this->user);

    $response = $this->postJson(route('dashboard.events.certificates.preview', $this->event), [
        'font_family' => 'Roboto',
        'font_color' => '#000000',
        'font_size' => 'Medium',
        'x_pos' => 50,
        'is_x_center' => true,
        'y_pos' => 50,
        'is_y_center' => true,
        'max_width' => 80,
        'max_height' => 20,
    ]);

    $response->assertStatus(422);
    $response->assertJson([
        'error' => 'Template sertifikat wajib diunggah terlebih dahulu.',
    ]);
});
