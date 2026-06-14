<?php

use App\Models\User;
use App\Mail\ResetPasswordOtpMail;
use Illuminate\Support\Facades\Mail;

test('forgot password request screen can be rendered', function () {
    $response = $this->get(route('password.request'));

    $response->assertOk();
});

test('forgot password OTP can be requested for valid email', function () {
    Mail::fake();

    $user = User::factory()->create();

    $response = $this->post(route('password.email'), ['email' => $user->email]);

    $response->assertRedirect(route('password.otp'));
    $this->assertEquals($user->email, session('password_reset_email'));

    Mail::assertSent(ResetPasswordOtpMail::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email);
    });
});

test('forgot password OTP can be requested for invalid email but does not reveal existence', function () {
    Mail::fake();

    $invalidEmail = 'doesnotexist@example.com';

    $response = $this->post(route('password.email'), ['email' => $invalidEmail]);

    $response->assertRedirect(route('password.otp'));
    $this->assertEquals($invalidEmail, session('password_reset_email'));

    Mail::assertSent(ResetPasswordOtpMail::class, function ($mail) use ($invalidEmail) {
        return $mail->hasTo($invalidEmail);
    });
});

test('OTP verification page can be rendered when session has email', function () {
    session(['password_reset_email' => 'test@example.com']);

    $response = $this->get(route('password.otp'));

    $response->assertOk();
});

test('OTP verification page redirects to request page when session has no email', function () {
    $response = $this->get(route('password.otp'));

    $response->assertRedirect(route('password.request'));
});

test('valid OTP auto verifies user email and allows access to reset page', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
        'otp_code' => '123456',
        'otp_expires_at' => now()->addMinutes(15),
    ]);

    session(['password_reset_email' => $user->email]);

    $response = $this->post(route('password.verify'), ['otp' => '123456']);

    $response->assertRedirect(route('password.reset_form'));
    $this->assertTrue(session('password_reset_verified'));

    $user->refresh();
    $this->assertNotNull($user->email_verified_at);
    $this->assertNull($user->otp_code);
});

test('invalid OTP fails verification', function () {
    $user = User::factory()->create([
        'otp_code' => '123456',
        'otp_expires_at' => now()->addMinutes(15),
    ]);

    session(['password_reset_email' => $user->email]);

    $response = $this->post(route('password.verify'), ['otp' => '654321']);

    $response->assertSessionHas('error');
    $this->assertNotTrue(session('password_reset_verified'));
});

test('reset password page requires OTP verification', function () {
    $response = $this->get(route('password.reset_form'));

    $response->assertRedirect(route('password.request'));
});

test('password can be reset after valid OTP verification', function () {
    $user = User::factory()->create();

    session([
        'password_reset_email' => $user->email,
        'password_reset_verified' => true,
    ]);

    $response = $this->post(route('password.reset_update'), [
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('success');

    $this->assertNull(session('password_reset_email'));
    $this->assertNull(session('password_reset_verified'));
});