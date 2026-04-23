<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['event_id', 'user_id', 'qr_token', 'status', 'checked_in_at'])]
class EventRegistration extends Model
{
    use HasFactory;
    /**
     * @return array<string, string>
     */
    protected function casts(): array {
        return [
            'checked_in_at'=> 'datetime'
        ];
    }

    public function certificate(): HasOne {
        return $this->hasOne(Certificate::class);
    }

    public function event(): BelongsTo {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
