<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EventService;

class ApiHomeController extends Controller
{
    public function __construct(private EventService $eventService) {}

    public function index()
    {
        return response()->json([
            'events' => $this->eventService->getLatestEvents(),
        ]);
    }
}
