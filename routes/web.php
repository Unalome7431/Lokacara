<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EventRegistrationController;

// Task 1
Route::get('/', [HomeController::class, 'index'])->name('home');

// Task 2: Login Routes (Assuming controllers exist as mentioned)
Route::get('/login', [\App\Http\Controllers\Auth\LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [\App\Http\Controllers\Auth\LoginController::class, 'login']);
Route::get('/auth/google', [\App\Http\Controllers\Auth\GoogleController::class, 'redirectToGoogle'])->name('login.google');
Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\GoogleController::class, 'handleGoogleCallback']);

// Task 3 & 4 Protected Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/events/{event}/join', [EventRegistrationController::class, 'store'])->name('events.join');
});

require __DIR__.'/settings.php';
