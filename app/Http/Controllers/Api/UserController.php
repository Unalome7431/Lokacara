<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Patch(
        path: '/api/user/settings',
        summary: 'Update user notification settings',
        tags: ['User Settings'],
        security: [['sanctum' => []]]
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['notifications_enabled'],
            properties: [
                new OA\Property(property: 'notifications_enabled', type: 'boolean', example: false),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Settings updated successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Settings updated successfully'),
                new OA\Property(
                    property: 'data',
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'notifications_enabled', type: 'boolean', example: false),
                    ]
                ),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'notifications_enabled' => 'required|boolean',
        ]);

        $user = $request->user();
        $user->notifications_enabled = $validated['notifications_enabled'];
        $user->save();

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => [
                'notifications_enabled' => (bool) $user->notifications_enabled,
            ],
        ]);
    }
}
