<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['registration_id', 'file_url', 'issued_at'])]
class Certificate extends Model
{
    use HasFactory;
    /**
     * @return array<string, string>
     */
    protected function casts(): array {
        return [
            'issued_at'=> 'datetime'
        ];
    }

    public function eventRegistration(): BelongsTo {
        return $this->belongsTo(EventRegistration::class, 'registration_id');
    }
}
