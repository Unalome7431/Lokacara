<?php

namespace App\Services;

use App\Models\Event;

class EventService
{
    public function getLatestEvents()
    {
        return Event::with('category')->latest()->get();
    }
}
