<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Notification',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', example: 1),
        new OA\Property(property: 'sender_name', type: 'string', example: 'Lokacara'),
        new OA\Property(property: 'message', type: 'string', example: 'Kamu berhasil terdaftar di Seminar AI.'),
        new OA\Property(property: 'type', type: 'string', enum: ['system', 'social'], example: 'system'),
        new OA\Property(property: 'category', type: 'string', nullable: true, example: 'registration_success'),
        new OA\Property(property: 'target', type: 'string', nullable: true, example: 'tickets'),
        new OA\Property(property: 'event_id', type: 'integer', nullable: true, example: 123),
        new OA\Property(property: 'is_read', type: 'boolean', example: false),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
    type: 'object'
)]
class NotificationSchema
{
}
