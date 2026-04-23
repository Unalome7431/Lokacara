<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiHomeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EventRegistrationController;

// Task 1
Route::get('/public-events', [ApiHomeController::class, 'index']);

// Task 2: Login Routes
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Task 3 & 4 Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/events/{event}/join', [EventRegistrationController::class, 'store']);
});
