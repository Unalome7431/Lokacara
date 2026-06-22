<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\DistributeCertificatesJob;
use App\Models\Certificate;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class CertificateApiController extends Controller
{
    #[OA\Get(
        path: '/api/organizer/events/{event}/certificates',
        summary: 'Get persistent certificate configuration state',
        tags: ['Certificates'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'event',
        in: 'path',
        description: 'Event ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Certificate state',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'event', ref: '#/components/schemas/Event'),
                new OA\Property(property: 'is_eligible', type: 'boolean', example: true),
                new OA\Property(property: 'has_template', type: 'boolean', example: true),
                new OA\Property(property: 'issued_count', type: 'integer', example: 5),
                new OA\Property(property: 'last_issued_at', type: 'string', format: 'date-time', nullable: true, example: '2026-07-16T10:00:00Z'),
                new OA\Property(property: 'status', type: 'string', enum: ['not_configured', 'ready', 'distributed'], example: 'ready'),
                new OA\Property(property: 'layout', type: 'object', properties: [
                    new OA\Property(property: 'font_family', type: 'string', nullable: true),
                    new OA\Property(property: 'font_color', type: 'string', nullable: true),
                    new OA\Property(property: 'font_size', type: 'string', nullable: true),
                    new OA\Property(property: 'x_pos', type: 'number', nullable: true),
                    new OA\Property(property: 'is_x_center', type: 'boolean'),
                    new OA\Property(property: 'y_pos', type: 'number', nullable: true),
                    new OA\Property(property: 'is_y_center', type: 'boolean'),
                    new OA\Property(property: 'max_width', type: 'number', nullable: true),
                    new OA\Property(property: 'max_height', type: 'number', nullable: true),
                ]),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    public function state(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $hasTemplate = $event->certificate_template
            && Storage::disk('local')->exists($event->certificate_template);

        $latestCertificate = Certificate::whereHas('eventRegistration', function ($q) use ($event) {
            $q->where('event_id', $event->id);
        })->latest('issued_at')->first();

        $issuedCount = Certificate::whereHas('eventRegistration', function ($q) use ($event) {
            $q->where('event_id', $event->id);
        })->count();

        $isEligible = $event->end_datetime->isPast()
            && $event->eventRegistrations()->where('status', 'present')->exists();

        if (! $hasTemplate || ! $event->certificate_font_family) {
            $derivedStatus = 'not_configured';
        } elseif ($issuedCount > 0) {
            $derivedStatus = 'distributed';
        } else {
            $derivedStatus = 'ready';
        }

        return response()->json([
            'event' => $event,
            'is_eligible' => $isEligible,
            'has_template' => $hasTemplate,
            'issued_count' => $issuedCount,
            'last_issued_at' => $latestCertificate?->issued_at,
            'status' => $derivedStatus,
            'layout' => [
                'font_family' => $event->certificate_font_family,
                'font_color' => $event->certificate_font_color,
                'font_size' => $event->certificate_font_size,
                'x_pos' => $event->certificate_x_pos,
                'is_x_center' => $event->certificate_is_x_center,
                'y_pos' => $event->certificate_y_pos,
                'is_y_center' => $event->certificate_is_y_center,
                'max_width' => $event->certificate_max_width,
                'max_height' => $event->certificate_max_height,
            ],
        ], 200);
    }

    #[OA\Get(
        path: '/api/organizer/events/{event}/certificates/template/stream',
        summary: 'Stream the saved certificate template image',
        tags: ['Certificates'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'event',
        in: 'path',
        description: 'Event ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Template image streamed'
    )]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    #[OA\Response(response: 404, description: 'No template stored or file missing')]
    public function streamTemplate(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (! $event->certificate_template || ! Storage::disk('local')->exists($event->certificate_template)) {
            return response()->json(['message' => 'Template not found.'], 404);
        }

        return response()->file(
            Storage::disk('local')->path($event->certificate_template),
            ['Content-Type' => Storage::disk('local')->mimeType($event->certificate_template)]
        );
    }

    #[OA\Post(
        path: '/api/organizer/events/{event}/certificates/template',
        summary: 'Upload a certificate template image',
        tags: ['Certificates'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'event',
        in: 'path',
        description: 'Event ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                required: ['template'],
                properties: [
                    new OA\Property(property: 'template', type: 'string', format: 'binary', description: 'Certificate template image (jpeg/png/jpg, max 5MB)'),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Template uploaded',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Template uploaded successfully'),
                new OA\Property(property: 'template_path', type: 'string', example: 'event-templates/1/abc123.jpg'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    public function uploadTemplate(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'template' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $directory = 'event-templates/'.$event->id;
        if (! Storage::disk('local')->exists($directory)) {
            Storage::disk('local')->makeDirectory($directory);
        }

        $newPath = $request->file('template')->store($directory, 'local');

        $previousTemplate = $event->getRawOriginal('certificate_template');
        $event->update(['certificate_template' => $newPath]);

        if ($previousTemplate && Storage::disk('local')->exists($previousTemplate)) {
            Storage::disk('local')->delete($previousTemplate);
        }

        return response()->json([
            'message' => 'Template uploaded successfully',
            'template_path' => $newPath,
        ], 200);
    }

    #[OA\Post(
        path: '/api/organizer/events/{event}/certificates/distribute',
        summary: 'Generate and distribute certificates to all attendees',
        tags: ['Certificates'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'event',
        in: 'path',
        description: 'Event ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['template_path', 'font_family', 'font_color', 'font_size', 'x_pos', 'is_x_center', 'y_pos', 'is_y_center'],
            properties: [
                new OA\Property(property: 'template_path', type: 'string', example: 'event-templates/1/abc123.jpg'),
                new OA\Property(property: 'font_family', type: 'string', example: 'Arial'),
                new OA\Property(property: 'font_color', type: 'string', example: '#000000'),
                new OA\Property(property: 'font_size', type: 'string', enum: ['Small', 'Medium', 'Large'], example: 'Medium'),
                new OA\Property(property: 'x_pos', type: 'number', format: 'float', example: 50),
                new OA\Property(property: 'is_x_center', type: 'boolean', example: true),
                new OA\Property(property: 'y_pos', type: 'number', format: 'float', example: 50),
                new OA\Property(property: 'is_y_center', type: 'boolean', example: true),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Certificates being distributed',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Certificates are being generated and distributed.'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Forbidden (not the owner)')]
    #[OA\Response(response: 404, description: 'Template file not found')]
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

        $templatePath = $validated['template_path'];

        if ($event->certificate_template && $templatePath === $event->certificate_template) {
            if (! Storage::disk('local')->exists($templatePath)) {
                return response()->json(['message' => 'Template file not found.'], 404);
            }
        } elseif ($this->isOwnedTemplatePath($event, $templatePath) && Storage::disk('local')->exists($templatePath)) {
            $event->update(['certificate_template' => $templatePath]);
        } else {
            return response()->json([
                'message' => 'Template file not found. Please re-upload the template.',
            ], 404);
        }

        $hasBlankParticipantName = $event->eventRegistrations()
            ->where('status', 'present')
            ->whereHas('user', function ($query) {
                $query->whereRaw("TRIM(COALESCE(name, '')) = ''");
            })
            ->exists();

        if ($hasBlankParticipantName) {
            return response()->json([
                'message' => 'Ada peserta hadir yang belum melengkapi nama profil. Lengkapi nama peserta sebelum mengirim sertifikat.',
            ], 422);
        }

        $layoutFields = collect($validated)->except('template_path')->toArray();
        $layoutFields['is_x_center'] = filter_var($layoutFields['is_x_center'], FILTER_VALIDATE_BOOLEAN);
        $layoutFields['is_y_center'] = filter_var($layoutFields['is_y_center'], FILTER_VALIDATE_BOOLEAN);

        $event->update([
            'certificate_template' => $templatePath,
            'certificate_font_family' => $layoutFields['font_family'],
            'certificate_font_color' => $layoutFields['font_color'],
            'certificate_font_size' => $layoutFields['font_size'],
            'certificate_x_pos' => $layoutFields['x_pos'],
            'certificate_is_x_center' => $layoutFields['is_x_center'],
            'certificate_y_pos' => $layoutFields['y_pos'],
            'certificate_is_y_center' => $layoutFields['is_y_center'],
        ]);

        DistributeCertificatesJob::dispatch($event, $layoutFields, $templatePath);

        return response()->json([
            'message' => 'Certificates are being generated and distributed.',
        ], 200);
    }

    #[OA\Get(
        path: '/api/events/{event}/certificate',
        summary: 'Download your certificate for an event',
        tags: ['Certificates'],
        security: [['sanctum' => []]]
    )]
    #[OA\Parameter(
        name: 'event',
        in: 'path',
        description: 'Event ID',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Certificate file downloaded'
    )]
    #[OA\Response(response: 404, description: 'Not registered, certificate not found, or file missing')]
    public function download(Request $request, Event $event)
    {
        $registration = $event->eventRegistrations()
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $registration) {
            return response()->json(['message' => 'You are not registered for this event.'], 404);
        }

        $certificate = Certificate::where('registration_id', $registration->id)->first();

        if (! $certificate) {
            return response()->json(['message' => 'Certificate not found or not issued yet.'], 404);
        }

        if (! Storage::disk('local')->exists($certificate->file_url)) {
            return response()->json(['message' => 'Certificate file is missing from storage.'], 404);
        }

        return response()->download(Storage::disk('local')->path($certificate->file_url), 'certificate.jpg');
    }

    private function isOwnedTemplatePath(Event $event, string $templatePath): bool
    {
        $templatePrefix = 'event-templates/'.$event->id.'/';

        return str_starts_with($templatePath, $templatePrefix);
    }
}
