<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function showRegisterForm()
    {
        return Inertia::render('auth/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::create([
          'email' => $request->email,
          'password' => bcrypt($request->password), // Password must be hashed!
        ]);

        Auth::login($user);
        return redirect()->route('onboard');
    }
}
