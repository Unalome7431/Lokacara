<?php

namespace App\Services;

use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

class CertificateRenderer
{
    private const FONT_FILES = [
        'Roboto' => 'Roboto.ttf',
        'Montserrat' => 'Montserrat.ttf',
        'Oswald' => 'Oswald.ttf',
        'Playfair' => 'Playfair.ttf',
        'GreatVibes' => 'GreatVibes.ttf',
    ];

    public function render(string $templatePath, string $name, array $config): ImageInterface
    {
        /** @var ImageManager $manager */
        $manager = new ImageManager(new Driver);
        $image = $manager->decode($templatePath);

        $displayName = trim($name) !== '' ? trim($name) : 'Nama Peserta';
        $fontFile = $this->fontFile($config['font_family'] ?? 'Roboto');
        $maxFontSize = $this->maxFontSize($config['font_size'] ?? 'Medium');
        $finalFontSize = $this->fitFontSize($image, $displayName, $fontFile, $maxFontSize, $config);

        $isXCenter = filter_var($config['is_x_center'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $isYCenter = filter_var($config['is_y_center'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $xPos = (float) ($config['x_pos'] ?? 50);
        $yPos = (float) ($config['y_pos'] ?? 50);

        $x = $isXCenter ? (int) ($image->width() / 2) : (int) ($image->width() * ($xPos / 100));
        $y = $isYCenter ? (int) ($image->height() / 2) : (int) ($image->height() * ($yPos / 100));
        $fontColor = $config['font_color'] ?? '#000000';

        $image->text($displayName, $x, $y, function ($font) use ($fontFile, $finalFontSize, $fontColor) {
            $font->file($fontFile);
            $font->size($finalFontSize);
            $font->color($fontColor);
            $font->align('center', 'center');
        });

        return $image;
    }

    public static function hasBlankName(?string $name): bool
    {
        return trim((string) $name) === '';
    }

    private function fontFile(string $fontFamily): string
    {
        $filename = self::FONT_FILES[$fontFamily] ?? self::FONT_FILES['Roboto'];
        $path = public_path("fonts/{$filename}");

        if (file_exists($path)) {
            return $path;
        }

        return public_path('fonts/'.self::FONT_FILES['Roboto']);
    }

    private function maxFontSize(string $fontSize): int
    {
        return match ($fontSize) {
            'Small' => 60,
            'Large' => 180,
            default => 120,
        };
    }

    private function fitFontSize(ImageInterface $image, string $name, string $fontFile, int $maxFontSize, array $config): int
    {
        $maxWidthPercent = (float) ($config['max_width'] ?? 80.0);
        $maxHeightPercent = (float) ($config['max_height'] ?? 20.0);
        $maxWidthBound = $image->width() * ($maxWidthPercent / 100);
        $maxHeightBound = $image->height() * ($maxHeightPercent / 100);

        if (! function_exists('imagettfbbox')) {
            return $maxFontSize;
        }

        $box = imagettfbbox($maxFontSize, 0, $fontFile, $name);
        if (! $box) {
            return $maxFontSize;
        }

        $textWidth = abs($box[4] - $box[0]);
        $textHeight = abs($box[5] - $box[1]);
        $widthRatio = $textWidth > 0 ? ($maxWidthBound / $textWidth) : 1.0;
        $heightRatio = $textHeight > 0 ? ($maxHeightBound / $textHeight) : 1.0;
        $ratio = min($widthRatio, $heightRatio);

        return $ratio < 1.0 ? max(8, (int) floor($maxFontSize * $ratio)) : $maxFontSize;
    }
}
