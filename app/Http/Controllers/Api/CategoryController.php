<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use OpenApi\Attributes as OA;

class CategoryController extends Controller
{
    #[OA\Get(
        path: '/api/categories',
        summary: 'Get all event categories',
        tags: ['Categories'],
    )]
    #[OA\Response(
        response: 200,
        description: 'List of categories',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(
                    property: 'data',
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/Category')
                ),
            ]
        )
    )]
    public function index()
    {
        $categories = Category::all();

        return response()->json([
            'data' => $categories,
        ], 200);
    }
}
