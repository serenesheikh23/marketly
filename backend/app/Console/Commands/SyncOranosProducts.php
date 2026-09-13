<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Services\OranosMarketService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncOranosProducts extends Command
{
    protected $signature = 'oranos:sync-products';

    protected $description = 'Sync products from Oranos Market API';

    public function handle(OranosMarketService $service): int
    {
        try {
            $products = $service->getProducts();
        } catch (\Throwable $e) {
            Log::error('Failed to fetch Oranos products', ['error' => $e->getMessage()]);
            $this->error('Failed to fetch products: '.$e->getMessage());
            return 1;
        }

        $defaultCategory = Category::firstOrCreate(
            ['slug' => 'oranos-other'],
            ['name' => 'Other', 'name_ar' => 'أخرى', 'type' => 'auto', 'icon' => 'package']
        );

        $synced = 0;
        $failed = 0;
        $sellable = 0;
        $unsellable = 0;

        foreach ($products as $product) {
            try {
                $oranosId = $product['id'];
                $name = $product['name'];
                $price = (float) ($product['price'] ?? 0);
                $basePrice = isset($product['base_price']) ? (float) $product['base_price'] : null;
                $hasQtyValues = !empty($product['qty_values']);

                $isActive = !$hasQtyValues
                    && $basePrice !== null
                    && $basePrice > 0
                    && $price > $basePrice;

                if ($isActive) {
                    $sellable++;
                } else {
                    $unsellable++;
                }

                $categoryName = $product['category_name'] ?? null;
                $params = $product['params'] ?? null;
                $qtyValues = $product['qty_values'] ?? null;

                if ($categoryName) {
                    $slug = Str::slug($categoryName);
                    if (empty($slug)) {
                        $slug = 'cat-'.md5($categoryName);
                    }
                    $category = Category::firstOrCreate(
                        ['slug' => $slug],
                        ['name' => $categoryName, 'name_ar' => $categoryName, 'type' => 'auto', 'icon' => 'package']
                    );
                } else {
                    $category = $defaultCategory;
                }

                $slug = Str::slug($name) . '-' . $oranosId;
                if (empty($slug)) {
                    $slug = 'product-' . $oranosId;
                }

                Product::updateOrCreate(
                    ['oranos_product_id' => $oranosId],
                    [
                        'category_id'    => $category->id,
                        'name'           => $name,
                        'name_ar'        => $name,
                        'description'    => $name,
                        'description_ar' => $name,
                        'base_price'     => $basePrice,
                        'price'          => $price,
                        'is_automation'  => true,
                        'qty_values'     => $qtyValues,
                        'params'         => $params,
                        'is_active'      => $isActive,
                        'slug'           => $slug,
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

        $this->info("Synced {$synced}. Failed: {$failed}. Linked: {$linked}. Sellable: {$sellable}. Unsellable: {$unsellable}.");

        return 0;
    }
}