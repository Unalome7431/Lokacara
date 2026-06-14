<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'Event',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', example: 1),
        new OA\Property(property: 'category_id', type: 'integer', nullable: true, example: 2),
        new OA\Property(property: 'type', type: 'string', enum: ['online', 'offline'], example: 'offline'),
        new OA\Property(property: 'poster', type: 'string', nullable: true, example: 'posters/abc123.jpg'),
        new OA\Property(property: 'poster_url', type: 'string', nullable: true, example: 'http://localhost:8000/api/posters/abc123.jpg'),
        new OA\Property(property: 'title', type: 'string', example: 'Summer Music Festival'),
        new OA\Property(property: 'description', type: 'string', example: 'A great music event'),
        new OA\Property(property: 'price', type: 'integer', nullable: true, example: 25000),
        new OA\Property(property: 'location_name', type: 'string', nullable: true, example: 'Central Park'),
        new OA\Property(property: 'address', type: 'string', nullable: true, example: '123 Main St, City'),
        new OA\Property(property: 'latitude', type: 'number', format: 'float', nullable: true, example: -6.2088),
        new OA\Property(property: 'longitude', type: 'number', format: 'float', nullable: true, example: 106.8456),
        new OA\Property(property: 'platform_name', type: 'string', nullable: true, example: 'Zoom'),
        new OA\Property(property: 'link', type: 'string', nullable: true, example: 'https://zoom.us/j/123456'),
        new OA\Property(property: 'start_datetime', type: 'string', format: 'date-time', example: '2026-07-15T09:00:00Z'),
        new OA\Property(property: 'end_datetime', type: 'string', format: 'date-time', example: '2026-07-15T17:00:00Z'),
        new OA\Property(property: 'capacity', type: 'integer', nullable: true, example: 100),
        new OA\Property(property: 'view_count', type: 'integer', example: 250),
        new OA\Property(property: 'status', type: 'string', example: 'active'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'category', ref: '#/components/schemas/Category'),
        new OA\Property(property: 'user', ref: '#/components/schemas/User'),
    ],
    type: 'object'
)]
class EventSchema
{
}
