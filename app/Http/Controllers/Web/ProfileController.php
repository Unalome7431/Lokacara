<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        return Inertia::render('Profile/Edit', [
            'user' => $request->user(),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'avatar' => 'nullable|image|max:5120', // 5MB max
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->getRawOriginal('avatar_url') && Storage::disk('local')->exists($user->getRawOriginal('avatar_url'))) {
                Storage::disk('local')->delete($user->getRawOriginal('avatar_url'));
            }

            $path = $request->file('avatar')->store('avatars', 'local');
            $user->avatar_url = $path;
        }

        $user->save();

        return redirect()->back()->with('status', 'Profile updated successfully.');
    }
}
