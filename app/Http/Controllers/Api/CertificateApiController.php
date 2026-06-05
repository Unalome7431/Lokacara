<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Certificate;
use App\Jobs\DistributeCertificatesJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class CertificateApiController extends Controller
{
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
                new OA\Property(property: 'template_path', type: 'string', example: 'temp/abc123.jpg'),
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

        $path = $request->file('template')->store('temp', 'local');

        return response()->json([
            'message' => 'Template uploaded successfully',
            'template_path' => $path,
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
                new OA\Property(property: 'template_path', type: 'string', example: 'temp/abc123.jpg'),
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
