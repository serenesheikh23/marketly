<?php

namespace App\Http\Controllers\Api\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->with(['children', 'manualOrderFields'])
            ->firstOrFail();

        return response()->json(['category' => $category]);
    }

    public function formSchema(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->with('manualOrderFields')
            ->firstOrFail();

        return response()->json([
            'category' => $category,
            'fields' => $category->manualOrderFields->sortBy('sort_order')->values(),
        ]);
    }
}
