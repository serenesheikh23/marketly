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
        try {
            $products = $service->getProducts();
        } catch (\Throwable $e) {
            Log::error('Failed to fetch Oranos products', ['error' => $e->getMessage()]);
            $this->error('Failed to fetch products: '.$e->getMessage());
            return 1;
        }

        // Oranos charges us its `price` field. `base_price` is Oranos' own
        // wholesale cost and has nothing to do with what we pay.
        $markup = (float) config('services.oranos.markup', 1.20);

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
                $oranosId    = $product['id'];
                $name        = $product['name'];
                $oranosPrice = (float) ($product['price'] ?? 0);
                $hasQtyValues = !empty($product['qty_values']);

                // What Oranos actually charges us.
                $ourCost = $oranosPrice;

                // What we charge the customer.
                $ourRetail = round($ourCost * $markup, 2);

                // Only packages with a positive cost and a real margin are sellable.
                $isActive = !$hasQtyValues
                    && $ourCost > 0
                    && $ourRetail > $ourCost
                    && $markup > 1.0;

                if ($isActive) {
                    $sellable++;
                } else {
                    $unsellable++;
                }

                $categoryName = $product['category_name'] ?? null;
                $params       = $product['params'] ?? null;
                $qtyValues    = $product['qty_values'] ?? null;

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
                        'base_price'     => $ourCost,       // our real cost basis
                        'price'          => $ourRetail,     // our retail (cost × markup)
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

        // ── Refresh store prices to match current product prices ──
        // Store owners set custom prices on top of our platform price. When
        // our price changes (e.g. a new sync with a different markup), the
        // store's custom_price becomes stale. Recompute from the current
        // platform price × 1.10 default for every automation product.
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

        $this->info("Synced {$synced}. Failed: {$failed}. Linked: {$linked}. Sellable: {$sellable}. Unsellable: {$unsellable}. Stores refreshed: {$updatedStores}.");

        return 0;
    }
}
