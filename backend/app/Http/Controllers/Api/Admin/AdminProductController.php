<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\CategoryType;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'externalStore']);

        if ($request->filled('category')) {
            $query->where('category_id', $request->integer('category'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('q')) {
            $term = $request->string('q');
            $query->where(fn($q) => $q->where('name', 'LIKE', "%{$term}%"));
        }

        $products = $query->latest()->paginate(25);
        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'type' => ['required', 'string', 'in:auto,manual'],
            'is_active' => ['nullable', 'boolean'],
            'external_store_id' => ['nullable', 'exists:external_stores,id'],
            'metadata' => ['nullable', 'array'],
        ]);

        $product = Product::create($data);
        return response()->json(['product' => $product->load(['category', 'externalStore'])], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'type' => ['sometimes', 'string', 'in:auto,manual'],
            'is_active' => ['sometimes', 'boolean'],
            'external_store_id' => ['nullable', 'exists:external_stores,id'],
            'metadata' => ['nullable', 'array'],
        ]);

        $product->update($data);
        return response()->json(['product' => $product->fresh(['category', 'externalStore'])]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted.']);
    }
}
