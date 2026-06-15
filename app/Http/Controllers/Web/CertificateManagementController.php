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

        $presentCount = $event->eventRegistrations()->where('status', 'present')->count();
        $isDone = now()->greaterThanOrEqualTo(\Illuminate\Support\Carbon::parse($event->end_datetime));

        return Inertia::render('Dashboard/Events/Certificates', [
            'event' => $event,
            'presentCount' => $presentCount,
            'isDone' => $isDone
        ]);
    }

    public function saveTemplate(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'template' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'font_family' => 'required|string',
            'font_color' => 'required|string',
            'font_size' => 'required|string|in:Small,Medium,Large',
            'x_pos' => 'required|numeric|min:0|max:100',
            'is_x_center' => 'required|boolean',
            'y_pos' => 'required|numeric|min:0|max:100',
            'is_y_center' => 'required|boolean',
        ]);

        if ($request->hasFile('template')) {
            $path = $request->file('template')->store('templates', 'local');
            if ($event->certificate_template) {
                \Illuminate\Support\Facades\Storage::disk('local')->delete($event->certificate_template);
            }
            $event->certificate_template = $path;
        }

        $event->certificate_font_family = $validated['font_family'];
        $event->certificate_font_color = $validated['font_color'];
        $event->certificate_font_size = $validated['font_size'];
        $event->certificate_x_pos = $validated['x_pos'];
        $event->certificate_is_x_center = filter_var($validated['is_x_center'], FILTER_VALIDATE_BOOLEAN);
        $event->certificate_y_pos = $validated['y_pos'];
        $event->certificate_is_y_center = filter_var($validated['is_y_center'], FILTER_VALIDATE_BOOLEAN);
        $event->save();

        return redirect()->back()->with('success', 'Konfigurasi sertifikat berhasil disimpan.');
    }

    public function distribute(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        if (now()->lessThan(\Illuminate\Support\Carbon::parse($event->end_datetime))) {
            return redirect()->back()->with('error', 'Sertifikat tidak dapat didistribusikan sebelum event selesai.');
        }

        $validated = $request->validate([
            'template' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'font_family' => 'required|string',
            'font_color' => 'required|string',
            'font_size' => 'required|string|in:Small,Medium,Large',
            'x_pos' => 'required|numeric|min:0|max:100',
            'is_x_center' => 'required|boolean',
            'y_pos' => 'required|numeric|min:0|max:100',
            'is_y_center' => 'required|boolean',
        ]);

        if ($request->hasFile('template')) {
            $path = $request->file('template')->store('templates', 'local');
            if ($event->certificate_template) {
                \Illuminate\Support\Facades\Storage::disk('local')->delete($event->certificate_template);
            }
            $event->certificate_template = $path;
        }

        if (empty($event->certificate_template)) {
            return redirect()->back()->withErrors(['template' => 'Template sertifikat wajib diunggah terlebih dahulu.']);
        }

        $event->certificate_font_family = $validated['font_family'];
        $event->certificate_font_color = $validated['font_color'];
        $event->certificate_font_size = $validated['font_size'];
        $event->certificate_x_pos = $validated['x_pos'];
        $event->certificate_is_x_center = filter_var($validated['is_x_center'], FILTER_VALIDATE_BOOLEAN);
        $event->certificate_y_pos = $validated['y_pos'];
        $event->certificate_is_y_center = filter_var($validated['is_y_center'], FILTER_VALIDATE_BOOLEAN);
        $event->save();

        $presentCount = $event->eventRegistrations()->where('status', 'present')->count();
        if ($presentCount === 0) {
            return redirect()->back()->with('error', 'Tidak ada peserta yang terdata hadir (checked-in) untuk menerima sertifikat.');
        }

        $tempPath = 'temp/' . \Illuminate\Support\Str::random(40) . '.' . pathinfo($event->certificate_template, PATHINFO_EXTENSION);
        \Illuminate\Support\Facades\Storage::disk('local')->copy($event->certificate_template, $tempPath);

        $config = [
            'font_family' => $event->certificate_font_family,
            'font_size' => $event->certificate_font_size,
            'font_color' => $event->certificate_font_color,
            'x_pos' => $event->certificate_x_pos,
            'is_x_center' => $event->certificate_is_x_center,
            'y_pos' => $event->certificate_y_pos,
            'is_y_center' => $event->certificate_is_y_center,
        ];

        DistributeCertificatesJob::dispatch($event, $config, $tempPath);

        return redirect()->back()->with('success', 'E-Sertifikat sedang diproses dan didistribusikan ke peserta yang hadir.');
    }

    public function showTemplate(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        if (empty($event->certificate_template)) {
            abort(404);
        }

        if (!\Illuminate\Support\Facades\Storage::disk('local')->exists($event->certificate_template)) {
            abort(404);
        }

        $path = \Illuminate\Support\Facades\Storage::disk('local')->path($event->certificate_template);

        return response()->file($path);
    }
}
