<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Web\DiscoveryController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EventRegistrationController;
use App\Http\Controllers\Web\AdminSessionController;
use App\Http\Controllers\Web\ProfileController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\AvatarController;
use Inertia\Inertia;

// Module 2: Discovery Routes
Route::get('/', [DiscoveryController::class, 'index'])->name('home');
Route::get('/events/search', [DiscoveryController::class, 'search'])->name('events.search');
Route::get('/events/{event}', [DiscoveryController::class, 'show'])->name('events.show');

// Login Routes
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);

// Register Routes
Route::get('/register', [RegisterController::class, 'showRegisterForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register']);

// Admin Login
Route::get('/admin/login', [AdminSessionController::class, 'create'])->middleware('guest')->name('admin.login');
Route::post('/admin/login', [AdminSessionController::class, 'store'])->middleware('guest');

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
    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.avatar.upload');
    
    // Secure Avatar Stream
    Route::get('/profile/avatar/{filename}', [AvatarController::class, 'show'])->name('profile.avatar.show');
});

require __DIR__.'/settings.php';
