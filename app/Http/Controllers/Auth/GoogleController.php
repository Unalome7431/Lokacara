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
            
            $user = User::updateOrCreate([
                'email' => $googleUser->email,
            ], [
                'name' => $googleUser->name,
                'password' => bcrypt(str()->random(24)),
            ]);

            Auth::login($user);

            return redirect()->intended('dashboard');
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Failed to authenticate using Google.');
        }
    }
}
