<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController
{
    public function showOnboardingForm()
    {
        return Inertia::render('Auth/Onboard');
    }

    public function onboard(Request $request)
    {
        $request->validate([
            'name' => ['required', 'unique:users,name'],
            'avatar_url' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $user = $request->user();

        $dataToUpdate = [
            'name' => $request->name,
        ];

        if ($request->hasFile('avatar_url')) {
            $path = $request->file('avatar_url')->store('avatars');
            $dataToUpdate['avatar_url'] = $path;
        }

        $user->update($dataToUpdate);

        return redirect()->route('home');
    }
}
