<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                $user->provider = $user->provider ?? 'google';
                $user->provider_id = $user->provider_id ?? $googleUser->id;
                if (! $user->email_verified_at) {
                    $user->email_verified_at = now();
                }
                $user->save();
            } else {
                $user = User::create([
                    'email' => $googleUser->email,
                    'name' => $googleUser->name,
                    'password' => bcrypt(str()->random(24)),
                    'email_verified_at' => now(),
                    'role' => 'user',
                    'provider' => 'google',
                    'provider_id' => $googleUser->id,
                ]);
            }

            Auth::login($user);

            return redirect('/');
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Failed to authenticate using Google.');
        }
    }
}
