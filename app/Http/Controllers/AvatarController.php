<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class AvatarController extends Controller
{
    public function show(string $filename)
    {
        $path = "avatars/{$filename}";

        if (!Storage::disk('local')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('local')->path($path);

        return response()->file($fullPath);
    }
}
