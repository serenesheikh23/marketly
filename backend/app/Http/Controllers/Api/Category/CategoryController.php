<?php

namespace App\Http\Controllers\Api\Category;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

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

        // Include active products on the category payload so the frontend
        // can render the page with a single round trip. We also expose
        // the full product list (including inactive) under `all_products`
        // for the admin views.
        $category->load(['products' => function ($q) {
            $q->where('is_active', true)->latest();
        }]);

        return response()->json(['category' => $category]);
    }

    public function formSchema(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        // FIX: Pull from the form_schema column, not the manualOrderFields relationship.
        // If it's a JSON string (old data), decode it. If it's an array, use it directly.
        $fields = $category->form_schema;
        if (is_string($fields)) {
            $fields = json_decode($fields, true);
        }

        return response()->json([
            'category' => $category,
            'fields' => $fields ?? [],
        ]);
    }
}
