<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['registration_id', 'file_url', 'issued_at'])]
class Certificate extends Model
{
    use HasFactory;

    protected $appends = ['file_url_full'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
        ];
    }

    protected function fileUrlFull(): Attribute
    {
        return Attribute::make(
            get: function ($value, $attributes) {
                if (! empty($attributes['file_url'])) {
                    $filename = basename($attributes['file_url']);

                    return request()->is('api/*')
                        ? url("/certificates/{$filename}")
                        : route('certificates.download', ['certificate' => $this->id]);
                }

                return asset('certificates/default_certificate.png');
            }
        );
    }

    public function eventRegistration(): BelongsTo
    {
        return $this->belongsTo(EventRegistration::class, 'registration_id');
    }
}
