<?php

namespace App\Jobs;

use App\Models\Event;
use App\Models\Certificate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class DistributeCertificatesJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Event $event, public array $config, public string $templatePath)
    {
        //
    }

    public function handle(): void
    {
        $registrations = $this->event->eventRegistrations()
            ->where('status', 'present')
            ->with('user')
            ->get();

        if ($registrations->isEmpty()) {
            Storage::disk('local')->delete($this->templatePath);
            return;
        }

        /** @var \Intervention\Image\ImageManager $manager */
        $manager = new ImageManager(new Driver());
        // Original Template Disk Path
        $fullTemplatePath = Storage::disk('local')->path($this->templatePath);
        
        // Font logic
        $fontFile = storage_path("app/fonts/{$this->config['font_family']}.ttf");
        // Fallback if font isn't actually placed in storage/app/fonts
        if (!file_exists($fontFile)) {
            $fontFile = null; 
        }

        foreach ($registrations as $registration) {
            if (!$registration->user) continue;

            $image = $manager->decode($fullTemplatePath);
            $attendeeName = $registration->user->name;

            // 1. Calculate dynamic font size using GD's imagettfbbox if font exists
            $maxFontSize = match ($this->config['font_size'] ?? 'Medium') {
                'Small' => 60,
                'Large' => 180,
                default => 120, // Medium
            };
            
            $finalFontSize = $maxFontSize;
            
            $maxWidthPercent = $this->config['max_width'] ?? 80.0;
            $maxHeightPercent = $this->config['max_height'] ?? 20.0;
            $maxWidthBound = $image->width() * ($maxWidthPercent / 100);
            $maxHeightBound = $image->height() * ($maxHeightPercent / 100);

            if ($fontFile && function_exists('imagettfbbox')) {
                $box = imagettfbbox($maxFontSize, 0, $fontFile, $attendeeName);
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

            // 2. Determine Coordinates (based on percentage from frontend)
            $x = $this->config['is_x_center'] ? (int) ($image->width() / 2) : (int) ($image->width() * ($this->config['x_pos'] / 100));
            $y = $this->config['is_y_center'] ? (int) ($image->height() / 2) : (int) ($image->height() * ($this->config['y_pos'] / 100));

            // 3. Write text onto the image
            $image->text($attendeeName, $x, $y, function ($font) use ($fontFile, $finalFontSize) {
                if ($fontFile) {
                    $font->file($fontFile);
                }
                $font->size($finalFontSize);
                // Use the font color from config, fallback to black
                $fontColor = $this->config['font_color'] ?? '#000000';
                $font->color($fontColor);
                
                // Alignment
                $font->align(
                    $this->config['is_x_center'] ? 'center' : 'left',
                    $this->config['is_y_center'] ? 'center' : 'top'
                );
            });

            // 4. Save individual certificate
            $filename = 'certificates/' . Str::uuid() . '.jpg';
            $savedPath = Storage::disk('local')->path($filename);
            
            // Ensure directory exists
            if (!Storage::disk('local')->exists('certificates')) {
                Storage::disk('local')->makeDirectory('certificates');
            }

            $image->save($savedPath, quality: 90);

            // 5. Store record in DB
            Certificate::updateOrCreate(
                ['registration_id' => $registration->id],
                [
                    'file_url' => $filename,
                    'issued_at' => now(),
                ]
            );
        }

        // Cleanup temporary template file
        Storage::disk('local')->delete($this->templatePath);
    }
}
