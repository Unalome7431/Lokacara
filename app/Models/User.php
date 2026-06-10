<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'avatar_url', 'phone', 'location', 'role', 'suspended_at', 'provider_id', 'provider'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    protected function avatarUrl(): Attribute {
        return Attribute::make(
            get: function ($value, $attributes) {
                if (!empty($attributes['avatar_url'])) {
                    // Check if it's already an absolute URL (like from Google or ui-avatars)
                    if (str_starts_with($attributes['avatar_url'], 'http')) {
                        return $attributes['avatar_url'];
                    }

                    $filename = basename($attributes['avatar_url']);
                    return request()->is('api/*') 
                        ? url("/api/profile/avatar/{$filename}") 
                        : route('profile.avatar.show', ['filename' => $filename]);
                }

                return asset('avatars/default.png');
            }
        );
    }

    public function events(): HasMany {
        return $this->hasMany(Event::class)->chaperone();
    }

    public function eventRegistrations(): HasMany {
        return $this->hasMany(EventRegistration::class)->chaperone();
    }

    public function eventReports(): HasMany {
        return $this->hasMany(EventReport::class, 'reporter_id')->chaperone();
    }

    public function notifications(): HasMany {
        return $this->hasMany(Notification::class)->chaperone();
    }

    public function bookmarks(): HasMany {
        return $this->hasMany(Bookmark::class)->chaperone();
    }
}
