<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushTokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'platform' => 'nullable|string|in:android,ios,web',
        ]);

        $user = $request->user();

        PushToken::updateOrCreate(
            ['token' => $request->token],
            [
                'user_id' => $user->id,
                'platform' => $request->platform ?? 'android',
                'last_used_at' => now(),
            ]
        );

        return response()->json(['message' => 'Push token registered.'], 200);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $user = $request->user();

        PushToken::where('user_id', $user->id)
            ->where('token', $request->token)
            ->delete();

        return response()->json(['message' => 'Push token removed.'], 200);
    }
}
