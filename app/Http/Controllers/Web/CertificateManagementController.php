<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Jobs\DistributeCertificatesJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CertificateManagementController extends Controller
{
    public function index(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        // Just to ensure attendees exist for frontend display stats
        $presentCount = $event->eventRegistrations()->where('status', 'present')->count();

        return Inertia::render('Dashboard/Events/Certificates', [
            'event' => $event,
            'presentCount' => $presentCount
        ]);
    }

    public function distribute(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'template' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'font_family' => 'required|string',
            'font_color' => 'required|string',
            'font_size' => 'required|string|in:Small,Medium,Large',
            'x_pos' => 'required|numeric|min:0|max:100',
            'is_x_center' => 'required|boolean',
            'y_pos' => 'required|numeric|min:0|max:100',
            'is_y_center' => 'required|boolean',
        ]);

        $templatePath = $request->file('template')->store('temp', 'local');

        $config = collect($validated)->except('template')->toArray();
        // Convert string booleans from FormData to actual booleans
        $config['is_x_center'] = filter_var($config['is_x_center'], FILTER_VALIDATE_BOOLEAN);
        $config['is_y_center'] = filter_var($config['is_y_center'], FILTER_VALIDATE_BOOLEAN);

        DistributeCertificatesJob::dispatch($event, $config, $templatePath);

        return redirect()->back()->with('success', 'Certificates are being generated and distributed.');
    }
}
