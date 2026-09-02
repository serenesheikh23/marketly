<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\ManualOrderField;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with(['children', 'manualOrderFields'])
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['categories' => $categories]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json(['category' => $category], 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json(['category' => $category->fresh(['manualOrderFields'])]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json(['message' => 'Cannot delete a category with products.'], 422);
        }
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }

    public function storeField(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string'],
            'key' => ['required', 'string'],
            'type' => ['required', 'string', 'in:text,textarea,select,checkbox,number'],
            'required' => ['nullable', 'boolean'],
            'options' => ['nullable', 'array'],
            'placeholder' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $field = ManualOrderField::create(array_merge($data, ['category_id' => $category->id]));

        return response()->json(['field' => $field], 201);
    }

    public function destroyField(ManualOrderField $field): JsonResponse
    {
        $field->delete();

        return response()->json(['message' => 'Field deleted.']);
    }
}
