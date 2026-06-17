<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class AvatarController extends Controller
{
    #[OA\Get(
        path: '/api/profile/avatar/{filename}',
        summary: 'Get avatar image file',
        tags: ['Media'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'filename',
        in: 'path',
        description: 'Avatar filename',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Avatar image file'
    )]
    #[OA\Response(response: 404, description: 'Avatar not found')]
    public function show(string $filename)
    {
        $path = "avatars/{$filename}";

        if (! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('local')->path($path);

        return response()->file($fullPath);
    }
}
