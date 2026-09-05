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
        // can render the page with a single round trip.
        $category->load(['products' => function ($q) {
            $q->where('is_active', true)->latest();
        }]);

        return response()->json(['category' => $category]);
    }

    public function formSchema(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        // 1. Try to use the new form_schema column
        $fields = $category->form_schema;
        if (is_string($fields)) {
            $fields = json_decode($fields, true);
        }

        // 2. FALLBACK - Safely wrapped so it doesn't crash the API
        if (empty($fields)) {
            try {
                $fields = $category->manualOrderFields()
                    ->orderBy('sort_order')
                    ->get()
                    ->map(function ($f) {
                        return [
                            'key' => $f->key,
                            'label' => $f->label,
                            'label_ar' => $f->label_ar ?? $f->label, // <-- Added this line
                            'type' => $f->type,
                            'required' => $f->required,
                            'options' => is_array($f->options) ? $f->options : json_decode($f->options ?? '[]', true),
                        ];
                    })->toArray();
            } catch (\Exception $e) {
                $fields = [];
            }
        }

        return response()->json([
            'category' => $category,
            'fields' => $fields ?? [],
        ]);
    }
}
