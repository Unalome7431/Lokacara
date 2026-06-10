<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use OpenApi\Attributes as OA;

class LocationController extends Controller
{
    #[OA\Get(
        path: '/api/locations',
        summary: 'Get all locations',
        tags: ['Locations'],
    )]
    #[OA\Response(
        response: 200,
        description: 'List of locations',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'data',
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'name', type: 'string', example: 'Surakarta'),
                        ]
                    )
                ),
            ]
        )
    )]
    public function index()
    {
        $locations = Location::orderBy('name')->get();

        return response()->json([
            'data' => $locations,
        ], 200);
    }
}
