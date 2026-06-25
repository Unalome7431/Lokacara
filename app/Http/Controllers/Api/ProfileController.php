<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;
use OpenApi\Attributes as OA;

class ProfileController extends Controller
{
    private function userPayload(User $user): array
    {
        $freshUser = $user->fresh();

        return array_merge($freshUser->toArray(), [
            'has_password' => $freshUser->hasPassword(),
        ]);
    }

    #[OA\Get(
        path: '/api/profile',
        summary: 'Get authenticated user profile',
        tags: ['Profile'],
        security: [['sanctum' => []]]
    )]
    #[OA\Response(
        response: 200,
        description: 'User profile',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'user', ref: '#/components/schemas/User'),
            ]
        )
    )]
    public function show(Request $request)
    {
        return response()->json([
            'user' => $this->userPayload($request->user()),
        ], 200);
    }

    #[OA\Patch(
        path: '/api/profile',
        summary: 'Update user profile (name, email, or avatar)',
        tags: ['Profile'],
        security: [['sanctum' => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'John Doe'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
                    new OA\Property(property: 'avatar', type: 'string', format: 'binary', description: 'Avatar image (max 5MB)'),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Profile updated',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Profile updated successfully'),
                new OA\Property(property: 'user', ref: '#/components/schemas/User'),
            ]
        )
    )]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:5120', // 5MB max
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }

        if (array_key_exists('location', $validated)) {
            $user->location = $validated['location'];
        }

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists and not default
            if ($user->getRawOriginal('avatar_url') && Storage::disk('local')->exists($user->getRawOriginal('avatar_url'))) {
                Storage::disk('local')->delete($user->getRawOriginal('avatar_url'));
            }

            $path = $request->file('avatar')->store('avatars', 'local');
            $user->avatar_url = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $this->userPayload($user),
        ], 200);
    }

    #[OA\Delete(
        path: '/api/user',
        summary: 'Delete authenticated user account',
        tags: ['Profile'],
        security: [['sanctum' => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'password', type: 'string', nullable: true, example: 'password_saat_ini'),
                new OA\Property(property: 'google_token', type: 'string', nullable: true, example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiZDM2...'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Account deleted successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Akun berhasil dihapus'),
            ]
        )
    )]
    #[OA\Response(response: 422, description: 'Invalid password')]
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'password' => 'nullable|string',
            'google_token' => 'nullable|string',
        ]);

        $user = $request->user();

        $hasPassword = $user->hasPassword();
        $hasGoogleToken = filled($validated['google_token'] ?? null);

        if (! $hasPassword && ! $hasGoogleToken) {
            return response()->json([
                'message' => 'Verifikasi akun diperlukan',
            ], 422);
        }

        if ($hasGoogleToken) {
            if ($user->provider !== 'google' || empty($user->provider_id)) {
                return response()->json([
                    'message' => 'Akun ini tidak terhubung ke Google',
                ], 422);
            }

            try {
                $googleUser = Socialite::driver('google')->userFromToken($validated['google_token']);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Google token tidak valid',
                ], 422);
            }

            if ((string) $googleUser->getId() !== (string) $user->provider_id) {
                return response()->json([
                    'message' => 'Google token tidak cocok dengan akun ini',
                ], 422);
            }
        } elseif (! Hash::check($validated['password'] ?? '', $user->password)) {
            return response()->json([
                'message' => 'Password tidak sesuai',
            ], 422);
        }

        $user->currentAccessToken()?->delete();

        $user->delete();

        return response()->json([
            'message' => 'Akun berhasil dihapus',
        ], 200);
    }

    #[OA\Post(
        path: '/api/profile/avatar',
        summary: 'Upload a new avatar image',
        tags: ['Profile'],
        security: [['sanctum' => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                required: ['avatar'],
                properties: [
                    new OA\Property(property: 'avatar', type: 'string', format: 'binary', description: 'Avatar image (max 5MB)'),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Avatar uploaded',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Avatar uploaded successfully'),
                new OA\Property(property: 'avatar_url', type: 'string', example: 'avatars/abc123.jpg'),
                new OA\Property(property: 'user', ref: '#/components/schemas/User'),
            ]
        )
    )]
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:5120', // 5MB max
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->getRawOriginal('avatar_url') && Storage::disk('local')->exists($user->getRawOriginal('avatar_url'))) {
                Storage::disk('local')->delete($user->getRawOriginal('avatar_url'));
            }

            $path = $request->file('avatar')->store('avatars', 'local');
            $user->avatar_url = $path;
            $user->save();
        }

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => $user->avatar_url,
            'user' => $this->userPayload($user),
        ], 200);
    }
}
