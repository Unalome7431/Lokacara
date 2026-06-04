<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Certificate;
use App\Jobs\DistributeCertificatesJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificateApiController extends Controller
{
    public function uploadTemplate(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'template' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $path = $request->file('template')->store('temp', 'local');

        return response()->json([
            'message' => 'Template uploaded successfully',
            'template_path' => $path,
        ], 200);
    }

    public function distribute(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'template_path' => 'required|string',
            'font_family' => 'required|string',
            'font_color' => 'required|string',
            'font_size' => 'required|string|in:Small,Medium,Large',
            'x_pos' => 'required|numeric|min:0|max:100',
            'is_x_center' => 'required|boolean',
            'y_pos' => 'required|numeric|min:0|max:100',
            'is_y_center' => 'required|boolean',
        ]);

        if (!Storage::disk('local')->exists($validated['template_path'])) {
            return response()->json(['message' => 'Template file not found.'], 404);
        }

        $config = collect($validated)->except('template_path')->toArray();
        $config['is_x_center'] = filter_var($config['is_x_center'], FILTER_VALIDATE_BOOLEAN);
        $config['is_y_center'] = filter_var($config['is_y_center'], FILTER_VALIDATE_BOOLEAN);

        DistributeCertificatesJob::dispatch($event, $config, $validated['template_path']);

        return response()->json([
            'message' => 'Certificates are being generated and distributed.'
        ], 200);
    }

    public function download(Request $request, Event $event)
    {
        $registration = $event->eventRegistrations()
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$registration) {
            return response()->json(['message' => 'You are not registered for this event.'], 404);
        }

        $certificate = Certificate::where('registration_id', $registration->id)->first();

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found or not issued yet.'], 404);
        }

        if (!Storage::disk('local')->exists($certificate->file_url)) {
            return response()->json(['message' => 'Certificate file is missing from storage.'], 404);
        }

        return response()->download(Storage::disk('local')->path($certificate->file_url), 'certificate.jpg');
    }
}
