<?php

use App\Mail\SendOtpMail;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('unverified user is redirected to profile when attempting to create an event', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard.events.create'));

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHas('error', 'Anda harus memverifikasi email untuk membuat event.');
});

test('unverified user cannot submit event creation', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('dashboard.events.store'), [
            'title' => 'Test Event',
            'description' => 'Test event description',
            'type' => 'online',
            'platform_name' => 'Zoom',
            'link' => 'https://zoom.us',
            'start_date' => now()->addDay()->toDateString(),
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHas('error', 'Anda harus memverifikasi email untuk membuat event.');
});

test('unverified user cannot join paid event', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $event = Event::factory()->create([
        'price' => 50000,
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('events.join', $event->id));

    $response->assertRedirect();
    $response->assertSessionHas('error', 'Anda harus memverifikasi email untuk bergabung dengan event berbayar.');
});

test('unverified user can join free event', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $event = Event::factory()->create([
        'price' => 0,
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('events.join', $event->id));

    $response->assertRedirect(route('dashboard'));
    $response->assertSessionHas('success', 'Successfully joined the event!');
});

test('user can request OTP code', function () {
    Mail::fake();

    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('profile.send-otp'));

    $user->refresh();

    expect($user->otp_code)->not->toBeNull();
    expect($user->otp_expires_at)->not->toBeNull();

    $response->assertRedirect(route('profile.verify-email'));
    $response->assertSessionHas('success', 'Kode OTP telah dikirim. Cek tab Inbox atau Spam pada Email Anda.');

    Mail::assertSent(SendOtpMail::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email) && $mail->otp === $user->otp_code;
    });
});

test('user can verify OTP code and become verified', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
        'otp_code' => '123456',
        'otp_expires_at' => now()->addMinutes(10),
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('profile.verify-otp'), [
            'otp' => '123456',
        ]);

    $user->refresh();

    expect($user->email_verified_at)->not->toBeNull();
    expect($user->otp_code)->toBeNull();
    expect($user->otp_expires_at)->toBeNull();

    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHas('success', 'Email Anda berhasil diverifikasi!');
});

test('user gets validation error with wrong OTP', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
        'otp_code' => '123456',
        'otp_expires_at' => now()->addMinutes(10),
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('profile.verify-otp'), [
            'otp' => '654321',
        ]);

    $user->refresh();

    expect($user->email_verified_at)->toBeNull();
    $response->assertSessionHas('error', 'Kode OTP yang Anda masukkan salah.');
});

test('user gets validation error with expired OTP', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
        'otp_code' => '123456',
        'otp_expires_at' => now()->subMinutes(1),
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('profile.verify-otp'), [
            'otp' => '123456',
        ]);

    $user->refresh();

    expect($user->email_verified_at)->toBeNull();
    $response->assertSessionHas('error', 'Kode OTP sudah kedaluwarsa. Silakan kirim ulang.');
});
