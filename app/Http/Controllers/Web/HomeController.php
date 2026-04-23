<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\EventService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function __construct(private EventService $eventService) {}

    public function index()
    {
        return Inertia::render('Home', [
            'events' => $this->eventService->getLatestEvents(),
            'isAuthenticated' => Auth::check(),
        ]);
    }
}
