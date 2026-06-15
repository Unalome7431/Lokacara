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
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\PosterController;
use App\Http\Controllers\Web\EventManagementController;
use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\CommunicationController;
use App\Http\Controllers\Web\CertificateManagementController;
use App\Http\Controllers\Web\CertificateController;
use App\Http\Controllers\ModerationController;
use App\Http\Controllers\AdminModerationController;
use Inertia\Inertia;

// Module 2: Discovery Routes
Route::get('/', [DiscoveryController::class, 'index'])->name('home');
Route::get('/events/search', [DiscoveryController::class, 'search'])->name('events.search');
Route::get('/events/{event}', [DiscoveryController::class, 'show'])->name('events.show');

if (!app()->runningUnitTests()) {
    // Login Routes
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.store');
}

// Register Routes
Route::get('/register', [RegisterController::class, 'showRegisterForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register'])->name('register.store');

// Password Reset Routes
Route::get('/forgot-password', [PasswordResetController::class, 'showRequestForm'])->name('password.request');
Route::post('/forgot-password', [PasswordResetController::class, 'sendOtp'])->name('password.email');
Route::get('/forgot-password/otp', [PasswordResetController::class, 'showOtpForm'])->name('password.otp');
Route::post('/forgot-password/otp', [PasswordResetController::class, 'verifyOtp'])->name('password.verify');
Route::get('/reset-password', [PasswordResetController::class, 'showResetForm'])->name('password.reset_form');
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->name('password.reset_update');

// Admin Login
Route::get('/admin/login', [AdminSessionController::class, 'create'])->middleware('guest')->name('admin.login');
Route::post('/admin/login', [AdminSessionController::class, 'store'])->middleware('guest');

// Google OAuth Routes
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])->name('login.google');
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// Protected Routes
Route::middleware(['auth', 'profile.completed'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/events/{event}/join', [EventRegistrationController::class, 'store'])->name('events.join');
});

Route::middleware(['auth'])->group(function () {
    // Onboarding Routes
    Route::get('/onboard', [OnboardingController::class, 'showOnboardingForm'])->name('onboard');
    Route::put('/onboard', [OnboardingController::class, 'onboard']);

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit.web');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update.web');
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.avatar.upload');
    
    // Secure Avatar Stream
    Route::get('/profile/avatar/{filename}', [AvatarController::class, 'show'])->name('profile.avatar.show');
    
    // Module 3: Organizer Hub - Event Management
    Route::get('/create', [EventManagementController::class, 'create'])->name('dashboard.events.create');
    Route::post('/create', [EventManagementController::class, 'store'])->name('dashboard.events.store');
    Route::get('/dashboard/events/{event}/edit', [EventManagementController::class, 'edit'])->name('dashboard.events.edit');
    Route::post('/dashboard/events/{event}', [EventManagementController::class, 'update'])->name('dashboard.events.update');
    Route::delete('/dashboard/events/{event}', [EventManagementController::class, 'destroy'])->name('dashboard.events.destroy');
    Route::get('/dashboard/events/{event}', [EventManagementController::class, 'show'])->name('dashboard.events.show');
    Route::get('/dashboard/events/{event}/attendees', [EventManagementController::class, 'attendees'])->name('dashboard.events.attendees');
    Route::delete('/dashboard/events/{event}/attendees/{registration}', [EventManagementController::class, 'kickAttendee'])->name('dashboard.events.attendees.kick');

    // Module 4: Communications & Attendance
    Route::get('/events/{event}/ticket', [AttendanceController::class, 'ticket'])->name('events.ticket');
    Route::post('/dashboard/events/{event}/attendance/scan', [AttendanceController::class, 'scan'])->name('dashboard.events.attendance.scan');
    Route::post('/dashboard/events/{event}/attendance/{registration}/toggle', [AttendanceController::class, 'toggle'])->name('dashboard.events.attendance.toggle');
    Route::post('/dashboard/events/{event}/reminders', [CommunicationController::class, 'sendReminder'])->name('dashboard.events.reminders');
    
    // Module 5: Fulfillment (E-Certificates) - Organizer Side
    Route::get('/dashboard/events/{event}/certificates', [CertificateManagementController::class, 'index'])->name('dashboard.events.certificates.index');
    Route::post('/dashboard/events/{event}/certificates/save', [CertificateManagementController::class, 'saveTemplate'])->name('dashboard.events.certificates.save');
    Route::post('/dashboard/events/{event}/certificates/distribute', [CertificateManagementController::class, 'distribute'])->name('dashboard.events.certificates.distribute');
    Route::get('/dashboard/events/{event}/certificates/template', [CertificateManagementController::class, 'showTemplate'])->name('dashboard.events.certificates.template');

    // Module 5: Fulfillment (E-Certificates) - Attendee Side
    Route::get('/dashboard/certificates', [CertificateController::class, 'index'])->name('dashboard.certificates.index');
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');

    // Module 6: Moderation (User)
    Route::post('/events/{event}/report', [ModerationController::class, 'reportEvent'])->name('events.report');
});

// Module 6: Moderation (Admin)
Route::middleware(['auth', 'can:admin-panels'])->group(function () {
    Route::get('/admin/moderation', [AdminModerationController::class, 'index'])->name('admin.moderation.index');
    Route::get('/admin/reports/{report}', [AdminModerationController::class, 'showReport'])->name('admin.reports.show');
    Route::post('/admin/events/{event}/ban', [AdminModerationController::class, 'banEvent'])->name('admin.events.ban');
    Route::post('/admin/users/{user}/ban', [AdminModerationController::class, 'banUser'])->name('admin.users.ban');
});

// Secure Poster Stream
Route::get('/posters/{filename}', [PosterController::class, 'show'])->name('poster.show');

require __DIR__.'/settings.php';
