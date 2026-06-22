<?php

namespace App\Jobs;

use App\Models\Certificate;
use App\Models\Event;
use App\Services\CertificateRenderer;
use App\Services\NotificationDispatchService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

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
            return;
        }

        $fullTemplatePath = Storage::disk('local')->path($this->templatePath);
        $renderer = app(CertificateRenderer::class);

        foreach ($registrations as $registration) {
            if (! $registration->user) {
                continue;
            }

            $attendeeName = $registration->user->name;

            if (CertificateRenderer::hasBlankName($attendeeName)) {
                throw new RuntimeException('Cannot generate certificate for an attendee without a profile name.');
            }

            $image = $renderer->render($fullTemplatePath, $attendeeName, $this->config);

            $filename = 'certificates/'.Str::uuid().'.jpg';
            $savedPath = Storage::disk('local')->path($filename);

            if (! Storage::disk('local')->exists('certificates')) {
                Storage::disk('local')->makeDirectory('certificates');
            }

            $image->save($savedPath, quality: 90);

            Certificate::updateOrCreate(
                ['registration_id' => $registration->id],
                [
                    'file_url' => $filename,
                    'issued_at' => now(),
                ]
            );
        }

        // Notifications
        $notifications = app(NotificationDispatchService::class);
        foreach ($registrations as $registration) {
            if ($registration->user) {
                $notifications->dispatch(
                    recipient: $registration->user,
                    category: 'certificate_available',
                    title: 'Sertifikat tersedia',
                    body: "Sertifikat untuk event {$this->event->title} sudah tersedia.",
                    target: 'certificates',
                    event: $this->event,
                );
            }
        }
    }
}
