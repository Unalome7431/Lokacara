<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

test('redirects to google provider', function () {
    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com'));

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('login.google'));
    $response->assertRedirect('https://accounts.google.com');
});

test('registers a new user when email does not exist', function () {
    $googleUser = new Laravel\Socialite\Two\User;
    $googleUser->id = 'google-id-123';
    $googleUser->name = 'Google User';
    $googleUser->email = 'oauth_test@example.com';

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($googleUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect('/');
    $this->assertAuthenticated();

    $user = User::where('email', 'oauth_test@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Google User')
        ->and($user->provider)->toBe('google')
        ->and($user->provider_id)->toBe('google-id-123')
        ->and($user->role)->toBe('user');
});

test('logs in existing user and links provider without modifying role or password', function () {
    // Create an existing user with manual password and admin role
    $existingUser = User::create([
        'name' => 'Original Admin',
        'email' => 'oauth_test@example.com',
        'password' => Hash::make('my-secret-password'),
        'role' => 'admin',
    ]);

    $googleUser = new Laravel\Socialite\Two\User;
    $googleUser->id = 'google-id-123';
    $googleUser->name = 'Google User';
    $googleUser->email = 'oauth_test@example.com';

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($googleUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect('/');
    $this->assertAuthenticated();

    // Verify existing user record is preserved
    $user = User::where('email', 'oauth_test@example.com')->first();
    expect($user->id)->toBe($existingUser->id)
        ->and($user->role)->toBe('admin') // Should remain admin!
        ->and($user->provider)->toBe('google') // provider is linked
        ->and($user->provider_id)->toBe('google-id-123') // provider_id is linked
        ->and(Hash::check('my-secret-password', $user->password))->toBeTrue(); // Password not removed!
});
