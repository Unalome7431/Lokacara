<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('settings', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings', [ProfileController::class, 'destroy'])->name('profile.destroy');



    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    // OTP Routes
    Route::post('settings/send-otp', [ProfileController::class, 'sendOtp'])->name('profile.send-otp');
    Route::get('settings/verify-email', [ProfileController::class, 'showOtpForm'])->name('profile.verify-email');
    Route::post('settings/verify-otp', [ProfileController::class, 'verifyOtp'])->name('profile.verify-otp');
});
