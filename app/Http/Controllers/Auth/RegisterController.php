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
        \Illuminate\Support\Facades\Log::info('RegisterController@register called with: ' . json_encode($request->except('password', 'password_confirmation')));
        $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed'],
            'policy' => ['required', 'accepted'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'policy.required' => 'Anda harus menyetujui persyaratan layanan.',
            'policy.accepted' => 'Anda harus menyetujui persyaratan layanan.',
        ]);

        $user = User::create([
          'email' => $request->email,
          'password' => $request->password,
        ]);

        Auth::login($user);
        $request->session()->regenerate();
        return redirect()->route('onboard');
    }
}
