<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'EventReport',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'event_id', type: 'integer', example: 1),
        new OA\Property(property: 'reporter_id', type: 'integer', example: 2),
        new OA\Property(property: 'reason', type: 'string', example: 'Inappropriate content'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'resolved', 'dismissed'], example: 'pending'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'user', ref: '#/components/schemas/User'),
        new OA\Property(property: 'event', ref: '#/components/schemas/Event'),
    ],
    type: 'object'
)]
class EventReportSchema {}
