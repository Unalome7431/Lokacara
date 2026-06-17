<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

class UserService
{
    public function handleSocialLogin($email, $name, $avatarUrl, $provider, $providerId)
    {
        $user = User::where('email', $email)->first();

        if ($user) {
            $user->update([
                'provider' => $provider,
                'provider_id' => $providerId,
            ]);

            return $user;
        }

        return User::create([
            'name' => $name,
            'email' => $email,
            'email_verified_at' => now(),
            'password' => null,
            'avatar_url' => $avatarUrl,
            'role' => 'user',
            'provider' => $provider,
            'provider_id' => $providerId,
        ]);
    }

    public function markAsVerified(User $user)
    {
        if (\is_null($user->email_verified_at)) {
            $user->email_verified_at = Carbon::now();
            $user->save();
        }
    }
}
