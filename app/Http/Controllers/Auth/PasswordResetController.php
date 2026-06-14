<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\ResetPasswordOtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PasswordResetController extends Controller
{
    /**
     * Show the forgot password request form.
     */
    public function showRequestForm(): Response
    {
        return Inertia::render('auth/ForgotPassword');
    }

    /**
     * Generate and send OTP for password reset.
     */
    public function sendOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ]);

        $email = $request->email;
        $otp = sprintf('%06d', mt_rand(0, 999999));
        $user = User::where('email', $email)->first();

        if ($user) {
            // Store OTP code and expiration time
            $user->otp_code = $otp;
            $user->otp_expires_at = now()->addMinutes(15);
            $user->save();

            \Illuminate\Support\Facades\Log::info("Password reset OTP untuk user {$email}: {$otp}");

            try {
                Mail::to($email)->send(new ResetPasswordOtpMail($user, $otp));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email reset OTP ke {$email}: " . $e->getMessage());
            }
        } else {
            // For invalid email, generate a dummy user and still send the OTP
            // but the user won't be able to verify it since there is no account.
            \Illuminate\Support\Facades\Log::info("Password reset OTP untuk INVALID email {$email}: {$otp}");

            $dummyUser = new User();
            $dummyUser->name = 'Pengguna';
            $dummyUser->email = $email;

            try {
                Mail::to($email)->send(new ResetPasswordOtpMail($dummyUser, $otp));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email reset OTP ke invalid email {$email}: " . $e->getMessage());
            }
        }

        // Store the reset email in the session
        session(['password_reset_email' => $email]);

        return to_route('password.otp')->with('success', 'Kode OTP telah dikirim ke email Anda. Cek inbox atau folder spam Anda.');
    }

    /**
     * Show the OTP input form for password reset.
     */
    public function showOtpForm(Request $request): Response|RedirectResponse
    {
        $email = session('password_reset_email');

        if (!$email) {
            return to_route('password.request');
        }

        return Inertia::render('settings/VerifyEmail', [
            'email' => $email,
            'isReset' => true,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Verify the OTP code for password reset.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ], [
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.size' => 'Kode OTP harus tepat 6 digit.',
        ]);

        $email = session('password_reset_email');

        if (!$email) {
            return to_route('password.request');
        }

        $user = User::where('email', $email)->first();

        // If email is invalid, verification fails
        if (!$user) {
            return back()->with('error', 'Kode OTP yang Anda masukkan salah.');
        }

        // Validate OTP code and expiration
        if (!$user->otp_code || $user->otp_code !== $request->otp) {
            return back()->with('error', 'Kode OTP yang Anda masukkan salah.');
        }

        if ($user->otp_expires_at && now()->gt($user->otp_expires_at)) {
            return back()->with('error', 'Kode OTP sudah kedaluwarsa. Silakan kirim ulang.');
        }

        // Auto verify user if they haven't been verified yet
        if (is_null($user->email_verified_at)) {
            $user->email_verified_at = now();
        }

        // Clear OTP
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        // Mark session as OTP verified
        session(['password_reset_verified' => true]);

        return to_route('password.reset_form')->with('success', 'Kode OTP berhasil diverifikasi. Silakan atur kata sandi baru Anda.');
    }

    /**
     * Show the change password form.
     */
    public function showResetForm(): Response|RedirectResponse
    {
        if (!session('password_reset_verified')) {
            return to_route('password.request');
        }

        return Inertia::render('auth/ResetPassword');
    }

    /**
     * Update the user password.
     */
    public function resetPassword(Request $request): RedirectResponse
    {
        if (!session('password_reset_verified')) {
            return to_route('password.request');
        }

        $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
        ], [
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal harus 8 karakter.',
        ]);

        $email = session('password_reset_email');
        $user = User::where('email', $email)->first();

        if ($user) {
            $user->password = $request->password;
            $user->save();
        }

        // Clear password reset session data
        session()->forget(['password_reset_email', 'password_reset_verified']);

        return to_route('login')->with('success', 'Kata sandi Anda berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.');
    }
}
