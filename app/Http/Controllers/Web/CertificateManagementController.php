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

        if ($request->input('template') === 'null' || $request->input('template') === 'undefined' || !$request->hasFile('template')) {
            $request->request->remove('template');
            $request->files->remove('template');
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
            'max_width' => 'required|numeric|min:10|max:100',
            'max_height' => 'required|numeric|min:5|max:100',
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
        $event->certificate_max_width = $validated['max_width'];
        $event->certificate_max_height = $validated['max_height'];
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

        if ($request->input('template') === 'null' || $request->input('template') === 'undefined' || !$request->hasFile('template')) {
            $request->request->remove('template');
            $request->files->remove('template');
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
            'max_width' => 'required|numeric|min:10|max:100',
            'max_height' => 'required|numeric|min:5|max:100',
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
        $event->certificate_max_width = $validated['max_width'];
        $event->certificate_max_height = $validated['max_height'];
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
            'max_width' => $event->certificate_max_width,
            'max_height' => $event->certificate_max_height,
        ];

        DistributeCertificatesJob::dispatchSync($event, $config, $tempPath);

        return redirect()->back()->with('success', 'E-Sertifikat berhasil dibuat dan didistribusikan ke peserta yang hadir.');
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

    public function preview(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($request->input('template') === 'null' || $request->input('template') === 'undefined' || !$request->hasFile('template')) {
            $request->request->remove('template');
            $request->files->remove('template');
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
            'max_width' => 'required|numeric|min:10|max:100',
            'max_height' => 'required|numeric|min:5|max:100',
        ]);

        if ($request->hasFile('template')) {
            $tempFile = $request->file('template')->getPathname();
            $extension = $request->file('template')->getClientOriginalExtension();
        } else {
            if (empty($event->certificate_template)) {
                return response()->json(['error' => 'Template sertifikat wajib diunggah terlebih dahulu.'], 422);
            }
            $tempFile = \Illuminate\Support\Facades\Storage::disk('local')->path($event->certificate_template);
            $extension = pathinfo($event->certificate_template, PATHINFO_EXTENSION);
        }

        /** @var \Intervention\Image\ImageManager $manager */
        $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
        $image = $manager->decode($tempFile);
        
        $fontFile = storage_path("app/fonts/{$validated['font_family']}.ttf");
        if (!file_exists($fontFile)) {
            $fontFile = null; 
        }

        $name = $request->user()->name; // Use host's own name as preview

        $maxFontSize = match ($validated['font_size']) {
            'Small' => 60,
            'Large' => 180,
            default => 120, // Medium
        };

        $finalFontSize = $maxFontSize;
        
        $maxWidthPercent = $validated['max_width'];
        $maxHeightPercent = $validated['max_height'];
        $maxWidthBound = $image->width() * ($maxWidthPercent / 100);
        $maxHeightBound = $image->height() * ($maxHeightPercent / 100);

        if ($fontFile && function_exists('imagettfbbox')) {
            $box = imagettfbbox($maxFontSize, 0, $fontFile, $name);
            if ($box) {
                $textWidth = abs($box[4] - $box[0]);
                $textHeight = abs($box[5] - $box[1]);
                
                $widthRatio = $textWidth > 0 ? ($maxWidthBound / $textWidth) : 1.0;
                $heightRatio = $textHeight > 0 ? ($maxHeightBound / $textHeight) : 1.0;
                
                $ratio = min($widthRatio, $heightRatio);
                if ($ratio < 1.0) {
                    $finalFontSize = max(8, (int) floor($maxFontSize * $ratio));
                }
            }
        }

        $x = filter_var($validated['is_x_center'], FILTER_VALIDATE_BOOLEAN)
            ? (int) ($image->width() / 2) 
            : (int) ($image->width() * ($validated['x_pos'] / 100));
            
        $y = filter_var($validated['is_y_center'], FILTER_VALIDATE_BOOLEAN)
            ? (int) ($image->height() / 2) 
            : (int) ($image->height() * ($validated['y_pos'] / 100));

        $image->text($name, $x, $y, function ($font) use ($fontFile, $finalFontSize, $validated) {
            if ($fontFile) {
                $font->file($fontFile);
            }
            $font->size($finalFontSize);
            $font->color($validated['font_color']);
            $font->align('center', 'center');
        });

        $tempOut = tempnam(sys_get_temp_dir(), 'cert_preview_') . '.' . $extension;
        $image->save($tempOut, quality: 90);

        return response()->download($tempOut, "preview_sertifikat.{$extension}")->deleteFileAfterSend(true);
    }
}
