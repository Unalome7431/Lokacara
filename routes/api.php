<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DiscoveryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EventRegistrationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\EventManagementApiController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\PosterController;

// Module 2: Discovery Routes
Route::get('/events/feed', [DiscoveryController::class, 'index']);
Route::get('/events/search', [DiscoveryController::class, 'search']);
Route::get('/events/{event}', [DiscoveryController::class, 'show']);

// Module 1: Authentication API Routes
Route::middleware('guest')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/admin/auth/login', [AdminAuthController::class, 'login']);
});

// Module 1: Authenticated User & Profile Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::get('/profile/avatar/{filename}', [AvatarController::class, 'show']);
    
    // Other Protected Routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/events/{event}/join', [EventRegistrationController::class, 'store']);
    
    // Module 3: Organizer Hub - Event Management
    Route::get('/organizer/events', [EventManagementApiController::class, 'index']);
    Route::post('/organizer/events', [EventManagementApiController::class, 'store']);
    Route::post('/organizer/events/{event}', [EventManagementApiController::class, 'update']);
    Route::delete('/organizer/events/{event}', [EventManagementApiController::class, 'destroy']);
    Route::get('/organizer/events/{event}/attendees', [EventManagementApiController::class, 'attendees']);
});

// Secure Poster Stream
Route::get('/posters/{filename}', [PosterController::class, 'show']);
