<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ], 200);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'avatar' => 'nullable|image|max:5120', // 5MB max
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }
        
        if (isset($validated['email'])) {
            $user->email = $validated['email'];
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
            'user' => $user,
        ], 200);
    }

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
            'user' => $user,
        ], 200);
    }
}

