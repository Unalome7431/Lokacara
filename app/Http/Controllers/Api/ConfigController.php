<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use OpenApi\Attributes as OA;

class ConfigController extends Controller
{
    #[OA\Get(
        path: '/api/config/tabs',
        summary: 'Get tab configuration for mobile app',
        tags: ['Config'],
    )]
    #[OA\Response(
        response: 200,
        description: 'Tab configurations',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'tickets_tabs',
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'key', type: 'string', example: 'upcoming'),
                            new OA\Property(property: 'label', type: 'string', example: 'Mendatang'),
                        ]
                    )
                ),
                new OA\Property(
                    property: 'notification_tabs',
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'key', type: 'string', example: 'activity'),
                            new OA\Property(property: 'label', type: 'string', example: 'Aktivitas'),
                        ]
                    )
                ),
            ]
        )
    )]
    public function tabs()
    {
        return response()->json([
            'tickets_tabs' => [
                ['key' => 'upcoming', 'label' => 'Mendatang'],
                ['key' => 'history', 'label' => 'Riwayat'],
            ],
            'notification_tabs' => [
                ['key' => 'activity', 'label' => 'Aktivitas'],
                ['key' => 'info', 'label' => 'Informasi'],
            ],
        ], 200);
    }
}
