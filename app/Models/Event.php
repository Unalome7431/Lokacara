<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['user_id', 'category_id', 'cover', 'title', 'description', 'location_name', 'latitude', 'longitude', 'start_datetime', 'end_datetime', 'capacity', 'view_count'])]
class Event extends Model
{
    /** @use HasFactory<EventFactory> */
    use HasFactory, SoftDeletes;
    /**
     * @return array<string, string>
     */
    protected function casts(): array {
        return [
            'start_datetime'=> 'datetime',
            'end_datetime'=> 'datetime',
            'latitude'=> 'decimal:8',
            'longitude'=> 'decimal:8'
        ];
    }

    public function eventRegistrations(): HasMany {
        return $this->hasMany(EventRegistration::class)->chaperone();
    }

    public function eventReports(): HasMany {
        return $this->hasMany(EventReport::class)->chaperone();
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo {
        return $this->belongsTo(Category::class);
    }
}
