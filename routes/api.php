<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminModerationApiController;
use App\Http\Controllers\Api\AttendanceApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CertificateApiController;
use App\Http\Controllers\Api\CommunicationApiController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DiscoveryController;
use App\Http\Controllers\Api\EventManagementApiController;
use App\Http\Controllers\Api\EventRegistrationController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\ModerationApiController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PushTokenController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\PosterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/locations', [LocationController::class, 'index']);
Route::get('/config/tabs', [ConfigController::class, 'tabs']);

// Module 2: Discovery Routes
Route::get('/events/feed', [DiscoveryController::class, 'index']);
Route::get('/events/search', [DiscoveryController::class, 'search']);
Route::get('/events/{event}', [DiscoveryController::class, 'show']);

// Module 1: Authentication API Routes
Route::middleware('guest')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/google', [AuthController::class, 'googleLogin']);
    Route::post('/admin/auth/login', [AdminAuthController::class, 'login']);
    Route::post('/auth/password/email', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/password/reset', [AuthController::class, 'resetPassword']);
});

Route::post('/auth/refresh', [AuthController::class, 'refresh']);

// Module 1: Authenticated User & Profile Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/password/change', [AuthController::class, 'changePassword']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::get('/profile/avatar/{filename}', [AvatarController::class, 'show']);
    Route::delete('/user', [ProfileController::class, 'destroy']);

    // Other Protected Routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/events/{event}/join', [EventRegistrationController::class, 'store']);
    Route::delete('/events/{event}/join', [EventRegistrationController::class, 'destroy']);

    // Module 3: Organizer Hub - Event Management
    Route::get('/organizer/events', [EventManagementApiController::class, 'index']);
    Route::post('/organizer/events', [EventManagementApiController::class, 'store']);
    Route::post('/organizer/events/{event}', [EventManagementApiController::class, 'update']);
    Route::delete('/organizer/events/{event}', [EventManagementApiController::class, 'destroy']);
    Route::get('/organizer/events/{event}/attendees', [EventManagementApiController::class, 'attendees']);

    // Module 4: Communications & Attendance
    Route::get('/events/{event}/attendance/qr', [AttendanceApiController::class, 'ticket']);
    Route::post('/organizer/events/{event}/attendance/scan', [AttendanceApiController::class, 'scan']);
    Route::patch('/organizer/events/{event}/attendance/{registration}/toggle', [AttendanceApiController::class, 'toggle']);
    Route::post('/organizer/events/{event}/reminders', [CommunicationApiController::class, 'sendReminder']);

    // E-Certificates
    Route::post('/organizer/events/{event}/certificates/template', [CertificateApiController::class, 'uploadTemplate']);
    Route::post('/organizer/events/{event}/certificates/distribute', [CertificateApiController::class, 'distribute']);
    Route::get('/events/{event}/certificate', [CertificateApiController::class, 'download']);

    // Module 6: Moderation (User)
    Route::post('/events/{event}/report', [ModerationApiController::class, 'reportEvent']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Bookmarks
    Route::get('/bookmarks', [BookmarkController::class, 'index']);
    Route::post('/bookmarks/{event}', [BookmarkController::class, 'store']);
    Route::delete('/bookmarks/{event}', [BookmarkController::class, 'destroy']);

    // Push Tokens
    Route::post('/user/push-tokens', [PushTokenController::class, 'store']);
    Route::delete('/user/push-tokens', [PushTokenController::class, 'destroy']);

    // User Settings
    Route::patch('/user/settings', [UserController::class, 'updateSettings']);
});

// Module 6: Moderation (Admin)
Route::middleware(['auth:sanctum', 'ability:admin'])->group(function () {
    Route::get('/admin/moderation', [AdminModerationApiController::class, 'index']);
    Route::get('/admin/reports/{report}', [AdminModerationApiController::class, 'showReport']);
    Route::post('/admin/events/{event}/ban', [AdminModerationApiController::class, 'banEvent']);
    Route::post('/admin/users/{user}/ban', [AdminModerationApiController::class, 'banUser']);
});

// Secure Poster Stream
Route::get('/posters/{filename}', [PosterController::class, 'show']);
