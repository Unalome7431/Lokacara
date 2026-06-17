<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Certificate',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'registration_id', type: 'integer', example: 1),
        new OA\Property(property: 'file_url', type: 'string', example: 'certificates/event_1_user_2.jpg'),
        new OA\Property(property: 'issued_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
    type: 'object'
)]
class CertificateSchema {}
