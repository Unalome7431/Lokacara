<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    #[OA\Get(
        path: '/api/dashboard',
        summary: 'Get user dashboard data (joined/hosted events, certificates)',
        tags: ['Participant'],
        security: [['sanctum' => []]]
    )]
    #[OA\Response(
        response: 200,
        description: 'Dashboard data',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'joined_events',
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/EventRegistration')
                ),
                new OA\Property(
                    property: 'hosted_events',
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/Event')
                ),
                new OA\Property(
                    property: 'certificates',
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/Certificate')
                ),
            ]
        )
    )]
    public function index()
    {
        return response()->json($this->dashboardService->getUserDashboardData());
    }
}
