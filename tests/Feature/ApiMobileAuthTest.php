<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

test('mobile google login creates passwordless user and returns has_password false', function () {
    $googleUser = new Laravel\Socialite\Two\User;
    $googleUser->id = 'google-mobile-123';
    $googleUser->name = 'Mobile Google User';
    $googleUser->email = 'mobile-google@example.com';
    $googleUser->avatar = 'https://example.com/avatar.png';

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('userFromToken')->once()->with('valid-google-token')->andReturn($googleUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->postJson('/api/auth/google', [
        'token' => 'valid-google-token',
    ]);

    $response->assertOk()
        ->assertJsonPath('user.email', 'mobile-google@example.com')
        ->assertJsonPath('user.provider', 'google')
        ->assertJsonPath('user.provider_id', 'google-mobile-123')
        ->assertJsonPath('user.has_password', false);

    $user = User::where('email', 'mobile-google@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->password)->toBeNull();
});

test('mobile google login links existing password user without removing password', function () {
    $existingUser = User::factory()->create([
        'email' => 'linked@example.com',
        'password' => Hash::make('existing-password'),
        'provider' => null,
        'provider_id' => null,
    ]);

    $googleUser = new Laravel\Socialite\Two\User;
    $googleUser->id = 'google-linked-123';
    $googleUser->name = 'Linked User';
    $googleUser->email = 'linked@example.com';
    $googleUser->avatar = 'https://example.com/avatar.png';

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('userFromToken')->once()->with('linked-google-token')->andReturn($googleUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->postJson('/api/auth/google', [
        'token' => 'linked-google-token',
    ]);

    $response->assertOk()
        ->assertJsonPath('user.id', $existingUser->id)
        ->assertJsonPath('user.provider', 'google')
        ->assertJsonPath('user.provider_id', 'google-linked-123')
        ->assertJsonPath('user.has_password', true);

    $existingUser->refresh();

    expect(Hash::check('existing-password', $existingUser->password))->toBeTrue();
});

test('mobile api allows google only user to create local password without old password', function () {
    $user = User::factory()->create([
        'provider' => 'google',
        'provider_id' => 'google-passwordless-123',
        'password' => null,
    ]);

    $response = $this
        ->actingAs($user, 'sanctum')
        ->postJson('/api/auth/password/change', [
            'new_password' => 'new-password-123',
            'new_password_confirmation' => 'new-password-123',
        ]);

    $response->assertOk()
        ->assertJsonPath('message', 'Password berhasil diubah');

    $user->refresh();

    expect($user->provider)->toBe('google')
        ->and($user->provider_id)->toBe('google-passwordless-123')
        ->and(Hash::check('new-password-123', $user->password))->toBeTrue();
});

test('mobile api still requires old password for existing password users', function () {
    $user = User::factory()->create([
        'password' => Hash::make('existing-password'),
    ]);

    $response = $this
        ->actingAs($user, 'sanctum')
        ->postJson('/api/auth/password/change', [
            'new_password' => 'new-password-123',
            'new_password_confirmation' => 'new-password-123',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('old_password');
});

test('mobile api allows linked google user to delete account with google token', function () {
    $user = User::factory()->create([
        'email' => 'delete-google@example.com',
        'provider' => 'google',
        'provider_id' => 'google-delete-123',
        'password' => null,
    ]);

    $googleUser = new Laravel\Socialite\Two\User;
    $googleUser->id = 'google-delete-123';
    $googleUser->name = 'Delete Google User';
    $googleUser->email = 'delete-google@example.com';

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('userFromToken')->once()->with('delete-google-token')->andReturn($googleUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this
        ->actingAs($user, 'sanctum')
        ->deleteJson('/api/user', [
            'google_token' => 'delete-google-token',
        ]);

    $response->assertOk()
        ->assertJsonPath('message', 'Akun berhasil dihapus');

    expect(User::find($user->id))->toBeNull();
});

test('mobile api rejects delete account when google token does not match account', function () {
    $user = User::factory()->create([
        'provider' => 'google',
        'provider_id' => 'google-delete-123',
        'password' => null,
    ]);

    $googleUser = new Laravel\Socialite\Two\User;
    $googleUser->id = 'google-delete-other';
    $googleUser->name = 'Other Google User';
    $googleUser->email = $user->email;

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('userFromToken')->once()->with('mismatch-google-token')->andReturn($googleUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this
        ->actingAs($user, 'sanctum')
        ->deleteJson('/api/user', [
            'google_token' => 'mismatch-google-token',
        ]);

    $response->assertStatus(422)
        ->assertJsonPath('message', 'Google token tidak cocok dengan akun ini');

    expect(User::find($user->id))->not->toBeNull();
});
