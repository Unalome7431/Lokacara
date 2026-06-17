<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Mail\SendOtpMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Settings/Profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Send OTP code for email verification.
     */
    public function sendOtp(Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($user->email_verified_at) {
            return to_route('profile.edit')->with('warning', 'Email Anda sudah terverifikasi.');
        }

        $otp = sprintf('%06d', mt_rand(0, 999999));
        $user->otp_code = $otp;
        $user->otp_expires_at = now()->addMinutes(15);
        $user->save();

        Log::info("OTP untuk user {$user->email}: {$otp}");

        try {
            Mail::to($user->email)->send(new SendOtpMail($user, $otp));
        } catch (\Exception $e) {
            Log::error("Gagal mengirim email OTP ke {$user->email}: ".$e->getMessage());
        }

        return to_route('profile.verify-email')->with('success', 'Kode OTP telah dikirim. Cek tab Inbox atau Spam pada Email Anda.');
    }

    /**
     * Show the OTP input form.
     */
    public function showOtpForm(Request $request): Response
    {
        return Inertia::render('Auth/VerifyEmail', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Verify the OTP code.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ], [
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.size' => 'Kode OTP harus tepat 6 digit.',
        ]);

        $user = $request->user();

        if ($user->email_verified_at) {
            return to_route('profile.edit')->with('warning', 'Email Anda sudah terverifikasi.');
        }

        if (! $user->otp_code || $user->otp_code !== $request->otp) {
            return back()->with('error', 'Kode OTP yang Anda masukkan salah.');
        }

        if ($user->otp_expires_at && now()->gt($user->otp_expires_at)) {
            return back()->with('error', 'Kode OTP sudah kedaluwarsa. Silakan kirim ulang.');
        }

        $user->email_verified_at = now();
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        return to_route('profile.edit')->with('success', 'Email Anda berhasil diverifikasi!');
    }
}
