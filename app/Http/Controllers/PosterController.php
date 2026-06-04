<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class PosterController extends Controller
{
    public function show(string $filename)
    {
        $path = "posters/{$filename}";

        if (!Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('local')->path($path);

        return response()->file($fullPath, [
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}
