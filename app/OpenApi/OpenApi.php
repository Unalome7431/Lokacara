<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Lokacara API',
    description: 'API documentation for the Lokacara event management platform. Use the Authorize button at the top to set your Sanctum Bearer token for authenticated endpoints.',
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Local development server'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Sanctum',
    description: 'Enter your Sanctum token. Get it by logging in via POST /api/auth/login or POST /api/auth/register.'
)]
#[OA\Tag(name: 'Authentication', description: 'Register, login, logout, and password management')]
#[OA\Tag(name: 'Discovery', description: 'Browse and search public events')]
#[OA\Tag(name: 'Profile', description: 'View and update user profile & avatar')]
#[OA\Tag(name: 'Participant', description: 'Dashboard, event registration, attendance, and reporting')]
#[OA\Tag(name: 'Organizer', description: 'Event management for organizers (CRUD, attendees, attendance scanning, reminders)')]
#[OA\Tag(name: 'Certificates', description: 'Upload certificate templates, distribute, and download e-certificates')]
#[OA\Tag(name: 'Admin Moderation', description: 'Admin-only endpoints for moderation queue, event/user banning')]
#[OA\Tag(name: 'Media', description: 'Serve poster and avatar images')]

#[OA\Get(
    path: '/api/user',
    summary: 'Get the authenticated user',
    tags: ['Profile'],
    security: [['sanctum' => []]]
)]
#[OA\Response(
    response: 200,
    description: 'Authenticated user',
    content: new OA\JsonContent(ref: '#/components/schemas/User')
)]
#[OA\Response(response: 401, description: 'Unauthenticated')]
class OpenApi {}
