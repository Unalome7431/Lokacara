<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['event_id', 'reporter_id', 'reason', 'description', 'status'])]
class EventReport extends Model
{
    use HasFactory;
    public function event(): BelongsTo {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}
