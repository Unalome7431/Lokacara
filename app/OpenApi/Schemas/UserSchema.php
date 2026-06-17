<?php

namespace App\OpenApi\Schemas;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'User',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', nullable: true, example: 'John Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
        new OA\Property(property: 'email_verified_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'avatar_url', type: 'string', nullable: true, example: 'avatars/abc123.jpg'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, example: '08123456789'),
        new OA\Property(property: 'location', type: 'string', nullable: true, example: 'Jakarta'),
        new OA\Property(property: 'role', type: 'string', example: 'user'),
        new OA\Property(property: 'suspended_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'provider', type: 'string', nullable: true, example: 'google'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
    type: 'object'
)]
class UserSchema {}
