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
use App\Http\Controllers\PosterController;
use App\Http\Controllers\Web\EventManagementController;
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
    
    // Module 3: Organizer Hub - Event Management
    Route::get('/dashboard/events', [EventManagementController::class, 'index'])->name('dashboard.events.index');
    Route::get('/dashboard/events/create', [EventManagementController::class, 'create'])->name('dashboard.events.create');
    Route::post('/dashboard/events', [EventManagementController::class, 'store'])->name('dashboard.events.store');
    Route::get('/dashboard/events/{event}/edit', [EventManagementController::class, 'edit'])->name('dashboard.events.edit');
    Route::post('/dashboard/events/{event}', [EventManagementController::class, 'update'])->name('dashboard.events.update');
    Route::delete('/dashboard/events/{event}', [EventManagementController::class, 'destroy'])->name('dashboard.events.destroy');
    Route::get('/dashboard/events/{event}/attendees', [EventManagementController::class, 'attendees'])->name('dashboard.events.attendees');
});

// Secure Poster Stream
Route::get('/posters/{filename}', [PosterController::class, 'show'])->name('poster.show');

require __DIR__.'/settings.php';
