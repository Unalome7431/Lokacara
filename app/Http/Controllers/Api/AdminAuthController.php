<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->role !== 'admin') {
            // Revoke current token/session immediately since they aren't authorized
            Auth::guard('web')->logout();
            return response()->json([
                'message' => 'Unauthorized access'
            ], 403);
        }

        $token = $user->createToken('admin_token', ['admin:access'])->plainTextToken;

        return response()->json([
            'message' => 'Admin login successful',
            'user' => $user,
            'token' => $token,
        ], 200);
    }
}
