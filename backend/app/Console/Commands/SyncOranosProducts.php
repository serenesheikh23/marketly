<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Services\OranosMarketService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncOranosProducts extends Command
{
    protected $signature = 'oranos:sync-products';

    protected $description = 'Sync products from Oranos Market API';

    public function handle(OranosMarketService $service): int
    {
        // First, try to fetch categories from Oranos API (if endpoint exists)
        $this->info('Fetching categories from Oranos...');
        $this->syncCategories($service);

        try {
            $products = $service->getProducts();
        } catch (\Throwable $e) {
            Log::error('Failed to fetch Oranos products', ['error' => $e->getMessage()]);
            $this->error('Failed to fetch products: '.$e->getMessage());

            return 1;
        }

        $markup = (float) config('services.oranos.markup', 1.20);

        $defaultCategory = Category::firstOrCreate(
            ['slug' => 'oranos-other'],
            ['name' => 'Other', 'name_ar' => 'أخرى', 'type' => 'auto', 'icon' => 'package']
        );

        $synced = 0;
        $failed = 0;
        $sellable = 0;
        $unsellable = 0;
        $categoriesUpdated = 0;

        foreach ($products as $product) {
            try {
                $oranosId = $product['id'];
                $name = $product['name'];
                $oranosPrice = (float) ($product['price'] ?? 0);
                $hasQtyValues = ! empty($product['qty_values']);

                $ourCost = $oranosPrice;
                $ourRetail = round($ourCost * $markup, 2);

                $isActive = ! $hasQtyValues
                    && $ourCost > 0
                    && $ourRetail > $ourCost
                    && $markup > 1.0;

                if ($isActive) {
                    $sellable++;
                } else {
                    $unsellable++;
                }

                $categoryName = $product['category_name'] ?? null;
                $params = $product['params'] ?? null;
                $qtyValues = $product['qty_values'] ?? null;

                // Extract Oranos category image, skip the placeholder
                $rawImg = $product['category_img'] ?? $product['category_image'] ?? $product['category_image_url'] ?? $product['category_image_base64'] ?? null;
                $categoryImg = null;
                $categoryImgBase64 = null;
                if (is_string($rawImg) && $rawImg !== '' && ! str_contains($rawImg, 'empty.png') && str_contains($rawImg, '/images/')) {
                    if (str_starts_with($rawImg, 'data:image/') || str_starts_with($rawImg, 'data:application/')) {
                        $categoryImgBase64 = $rawImg;
                    } else {
                        $categoryImg = $rawImg;
                    }
                }

                // Extract Oranos product image
                $productImg = null;
                $productImgBase64 = null;
                foreach (['image', 'image_url', 'img', 'picture', 'thumbnail', 'photo', 'image_base64'] as $imgField) {
                    $rawProductImg = $product[$imgField] ?? null;
                    if (is_string($rawProductImg) && $rawProductImg !== '' && ! str_contains($rawProductImg, 'empty.png') && str_contains($rawProductImg, '/images/')) {
                        if (str_starts_with($rawProductImg, 'data:image/') || str_starts_with($rawProductImg, 'data:application/')) {
                            $productImgBase64 = $rawProductImg;
                        } else {
                            $productImg = $rawProductImg;
                        }
                        break;
                    }
                }

                if ($categoryName) {
                    $slug = Str::slug($categoryName);
                    if (empty($slug)) {
                        $slug = 'cat-'.md5($categoryName);
                    }
                    $category = Category::firstOrCreate(
                        ['slug' => $slug],
                        ['name' => $categoryName, 'name_ar' => $categoryName, 'type' => 'auto', 'icon' => 'package']
                    );

                    // Always set the image_url to match what Oranos currently reports.
                    // If Oranos sends empty.png (their placeholder), we store null so
                    // the frontend falls back to a letter avatar.
                    $updateData = [];
                    if ($category->image_url !== $categoryImg) {
                        $updateData['image_url'] = $categoryImg;
                    }
                    if ($categoryImgBase64 && $category->image_base64 !== $categoryImgBase64) {
                        $updateData['image_base64'] = $categoryImgBase64;
                    }
                    if (! empty($updateData)) {
                        $category->update($updateData);
                        $categoriesUpdated++;
                    }
                } else {
                    $category = $defaultCategory;
                }

                $slug = Str::slug($name).'-'.$oranosId;
                if (empty($slug)) {
                    $slug = 'product-'.$oranosId;
                }

                Product::updateOrCreate(
                    ['oranos_product_id' => $oranosId],
                    [
                        'category_id' => $category->id,
                        'name' => $name,
                        'name_ar' => $name,
                        'description' => $name,
                        'description_ar' => $name,
                        'base_price' => $ourCost,
                        'price' => $ourRetail,
                        'is_automation' => true,
                        'qty_values' => $qtyValues,
                        'params' => $params,
                        'is_active' => $isActive,
                        'slug' => $slug,
                        'image_url' => $productImg,
                        'image_base64' => $productImgBase64,
                    ]
                );

                $synced++;
            } catch (\Throwable $e) {
                $failed++;
                Log::warning('Failed to sync Oranos product', ['oranos_id' => $product['id'] ?? null, 'error' => $e->getMessage()]);
            }
        }

        $linked = 0;
        $topCategories = Category::whereNull('parent_id')->get();
        foreach ($topCategories as $category) {
            if (preg_match('/^(.+?)\s*\(/', $category->name, $matches)) {
                $parentName = trim($matches[1]);
                $parentSlug = Str::slug($parentName);
                if (empty($parentSlug)) {
                    $parentSlug = 'cat-'.md5($parentName);
                }
                $parent = Category::firstOrCreate(
                    ['slug' => $parentSlug],
                    ['name' => $parentName, 'name_ar' => $parentName, 'type' => 'auto', 'icon' => 'package']
                );
                if ($category->parent_id !== $parent->id) {
                    $category->update(['parent_id' => $parent->id]);
                }
                $linked++;
            }
        }

        // Refresh store prices to match current product prices
        $updatedStores = 0;
        $storeMarkup = 1.10;

        DB::table('stores')->orderBy('id')->chunk(50, function ($stores) use (&$updatedStores, $storeMarkup) {
            foreach ($stores as $store) {
                $rows = DB::table('store_product')
                    ->join('products', 'store_product.product_id', '=', 'products.id')
                    ->where('store_product.store_id', $store->id)
                    ->where('products.is_automation', true)
                    ->select('store_product.id as pivot_id', 'products.price as product_price')
                    ->get();

                foreach ($rows as $row) {
                    DB::table('store_product')
                        ->where('id', $row->pivot_id)
                        ->update(['custom_price' => round((float) $row->product_price * $storeMarkup, 2)]);
                }
                $updatedStores++;
            }
        });

        $this->info("Synced {$synced}. Failed: {$failed}. Linked: {$linked}. Sellable: {$sellable}. Unsellable: {$unsellable}. Stores refreshed: {$updatedStores}. Categories updated: {$categoriesUpdated}.");

        return 0;
    }

    private function syncCategories(OranosMarketService $service): void
    {
        try {
            $categories = $service->getCategories();
        } catch (\Throwable $e) {
            $this->warn('Categories endpoint not available, falling back to product-based category creation: '.$e->getMessage());

            return;
        }

        $synced = 0;
        $categoriesUpdated = 0;

        foreach ($categories as $categoryData) {
            try {
                $oranosId = $categoryData['id'] ?? null;
                $name = $categoryData['name'] ?? null;
                $parentId = $categoryData['parent_id'] ?? null;

                if (! $name) {
                    continue;
                }

                $slug = Str::slug($name);
                if (empty($slug)) {
                    $slug = 'cat-'.md5($name);
                }

                // Extract Oranos category image
                $rawImg = $categoryData['image'] ?? $categoryData['image_url'] ?? $categoryData['img'] ?? $categoryData['image_base64'] ?? null;
                $categoryImg = null;
                $categoryImgBase64 = null;
                if (is_string($rawImg) && $rawImg !== '' && ! str_contains($rawImg, 'empty.png') && str_contains($rawImg, '/images/')) {
                    if (str_starts_with($rawImg, 'data:image/') || str_starts_with($rawImg, 'data:application/')) {
                        $categoryImgBase64 = $rawImg;
                    } else {
                        $categoryImg = $rawImg;
                    }
                }

                $category = Category::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => $name, 'name_ar' => $name, 'type' => 'auto', 'icon' => 'package']
                );

                // Store Oranos category ID for parent linking
                if ($oranosId && ! $category->oranos_category_id) {
                    $category->update(['oranos_category_id' => $oranosId]);
                }

                // Update category image if changed
                $updateData = [];
                if ($category->image_url !== $categoryImg) {
                    $updateData['image_url'] = $categoryImg;
                }
                if ($categoryImgBase64 && $category->image_base64 !== $categoryImgBase64) {
                    $updateData['image_base64'] = $categoryImgBase64;
                }
                if (! empty($updateData)) {
                    $category->update($updateData);
                    $categoriesUpdated++;
                }

                // Handle parent category linking
                if ($parentId) {
                    $parent = Category::where('oranos_category_id', $parentId)->first();
                    if ($parent && $category->parent_id !== $parent->id) {
                        $category->update(['parent_id' => $parent->id]);
                    }
                }

                $synced++;
            } catch (\Throwable $e) {
                Log::warning('Failed to sync Oranos category', ['oranos_id' => $categoryData['id'] ?? null, 'error' => $e->getMessage()]);
            }
        }

        $this->info("Pre-synced {$synced} categories from Oranos API. Categories updated: {$categoriesUpdated}.");
    }
}
