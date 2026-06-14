<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class PosterController extends Controller
{
    #[OA\Get(
        path: '/api/posters/{filename}',
        summary: 'Get event poster image file',
        tags: ['Media'],
    )]
    #[OA\Parameter(
        name: 'filename',
        in: 'path',
        description: 'Poster filename',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: 200,
        description: 'Poster image file with 1-year cache'
    )]
    #[OA\Response(response: 404, description: 'Poster not found')]
    public function show(string $filename)
    {
        $path = "posters/{$filename}";

        if (!Storage::disk('local')->exists($path)) {
            return redirect()->to(asset('covers/default_cover.jpg'));
        }

        $fullPath = Storage::disk('local')->path($path);

        return response()->file($fullPath, [
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}
