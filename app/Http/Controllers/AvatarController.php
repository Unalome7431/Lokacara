<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class AvatarController extends Controller
{
    public function show(string $filename)
    {
        $path = "avatars/{$filename}";

        if (!Storage::disk('private')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('private')->path($path);

        return response()->file($fullPath);
    }
}
