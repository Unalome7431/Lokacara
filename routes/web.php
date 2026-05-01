<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EventRegistrationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\OnboardingController;
use Inertia\Inertia;

// Home Page Route
Route::get('/', [HomeController::class, 'index'])->name('home');

// Login Routes
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);

// Register Routes
Route::get('/register', [RegisterController::class, 'showRegisterForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register']);

// Onboarding Routes
Route::get('/onboard', [OnboardingController::class, 'showOnboardingForm'])->name('onboard');
Route::put('/onboard', [OnboardingController::class, 'onboard']);

// Google OAuth Routes
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])->name('login.google');
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// Protected Routes
Route::middleware(['auth', 'verified', 'profile.completed'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/events/{event}/join', [EventRegistrationController::class, 'store'])->name('events.join');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/avatars/{user}', function (App\Models\User $user) {
        $path = $user->getRawOriginal('avatar_url');
        if (!$path || !\Illuminate\Support\Facades\Storage::exists($path)) {
            return response()->file(public_path('avatars/default.png'));
        }
        return \Illuminate\Support\Facades\Storage::response($path);
    })->name('avatar.show');
});

require __DIR__.'/settings.php';
