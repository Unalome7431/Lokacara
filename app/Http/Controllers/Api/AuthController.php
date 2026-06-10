<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use App\Models\User;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/api/auth/register',
        summary: 'Register a new user account',
        tags: ['Authentication'],
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['name', 'email', 'password', 'password_confirmation'],
            properties: [
                new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'John Doe'),
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                new OA\Property(property: 'password', type: 'string', minLength: 8, example: 'password123'),
                new OA\Property(property: 'password_confirmation', type: 'string', example: 'password123'),
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'User registered successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'User registered successfully'),
                new OA\Property(property: 'user', ref: '#/components/schemas/User'),
                new OA\Property(property: 'token', type: 'string', example: '1|abc123token...'),
            ]
        )
    )]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user', // Default role
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    #[OA\Post(
        path: '/api/auth/login',
        summary: 'Login with email and password',
        tags: ['Authentication'],
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email', 'password'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                new OA\Property(property: 'password', type: 'string', example: 'password123'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Login successful',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Login successful'),
                new OA\Property(property: 'user', ref: '#/components/schemas/User'),
                new OA\Property(property: 'token', type: 'string', example: '1|abc123token...'),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Invalid login details')]
    #[OA\Response(response: 403, description: 'Account suspended')]
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

        // Check if user is suspended
        if ($user->suspended_at) {
            Auth::guard('web')->logout(); // Ensure not logged in on web guard too if mixed
            return response()->json([
                'message' => 'Your account is suspended.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    #[OA\Post(
        path: '/api/auth/logout',
        summary: 'Logout and revoke current access token',
        tags: ['Authentication'],
        security: [['sanctum' => []]]
    )]
    #[OA\Response(
        response: 200,
        description: 'Logged out successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Logged out successfully'),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }

    #[OA\Post(
        path: '/api/auth/refresh',
        summary: 'Refresh expired access token',
        tags: ['Authentication'],
        security: [['sanctum' => []]]
    )]
    #[OA\Response(
        response: 200,
        description: 'New access token',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'token', type: 'string', example: '1|abc123token...'),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Invalid or expired token')]
    public function refresh(Request $request)
    {
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        $id = null;
        if (str_contains($bearerToken, '|')) {
            [$id, $plainText] = explode('|', $bearerToken, 2);
        }

        if (!$id || !is_numeric($id)) {
            return response()->json(['message' => 'Invalid token format'], 401);
        }

        $accessToken = \Laravel\Sanctum\PersonalAccessToken::find($id);

        if (!$accessToken) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        $user = $accessToken->tokenable;

        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        if ($user->suspended_at) {
            return response()->json(['message' => 'Your account is suspended.'], 403);
        }

        $accessToken->delete();

        $newToken = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $newToken,
        ], 200);
    }

    #[OA\Post(
        path: '/api/auth/password/change',
        summary: 'Change password for authenticated user',
        tags: ['Authentication'],
        security: [['sanctum' => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['old_password', 'new_password', 'new_password_confirmation'],
            properties: [
                new OA\Property(property: 'old_password', type: 'string', example: 'password_lama'),
                new OA\Property(property: 'new_password', type: 'string', minLength: 8, example: 'password_baru'),
                new OA\Property(property: 'new_password_confirmation', type: 'string', example: 'password_baru'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Password changed successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Password berhasil diubah'),
            ]
        )
    )]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['old_password'], $user->password)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'old_password' => ['Kata sandi lama tidak sesuai'],
                ],
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($validated['new_password']),
        ])->save();

        return response()->json([
            'message' => 'Password berhasil diubah',
        ], 200);
    }

    #[OA\Post(
        path: '/api/auth/password/email',
        summary: 'Send password reset link to email',
        tags: ['Authentication'],
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Password reset link sent',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'We have emailed your password reset link.'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Email not found or reset failed')]
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $status = Password::broker()->sendResetLink(
            $request->only('email')
        );

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)], 200)
            : response()->json(['email' => [__($status)]], 400);
    }

    #[OA\Post(
        path: '/api/auth/password/reset',
        summary: 'Reset password with token from email',
        tags: ['Authentication'],
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['token', 'email', 'password', 'password_confirmation'],
            properties: [
                new OA\Property(property: 'token', type: 'string', example: 'reset-token-from-email'),
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                new OA\Property(property: 'password', type: 'string', minLength: 8, example: 'newpassword123'),
                new OA\Property(property: 'password_confirmation', type: 'string', example: 'newpassword123'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Password reset successful',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Your password has been reset.'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Invalid token or email')]
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)], 200)
            : response()->json(['email' => [__($status)]], 400);
    }
}

