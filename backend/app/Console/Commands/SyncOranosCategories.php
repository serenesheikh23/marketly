<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Services\OranosMarketService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncOranosCategories extends Command
{
    protected $signature = 'oranos:sync-categories';

    protected $description = 'Sync categories from Oranos Market API';

    public function handle(OranosMarketService $service): int
    {
        try {
            $categories = $service->getCategories();
        } catch (\Throwable $e) {
            Log::error('Failed to fetch Oranos categories', ['error' => $e->getMessage()]);
            $this->error('Failed to fetch categories: '.$e->getMessage());

            return 1;
        }

        $synced = 0;
        $failed = 0;
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
                if (is_string($rawImg) && $rawImg !== '' && ! str_contains($rawImg, 'empty.png')) {
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

                // Handle parent category
                if ($parentId) {
                    $parent = Category::where('oranos_category_id', $parentId)->first();
                    if ($parent && $category->parent_id !== $parent->id) {
                        $category->update(['parent_id' => $parent->id]);
                    }
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

                // Store Oranos category ID for parent linking
                if ($oranosId && ! $category->oranos_category_id) {
                    $category->update(['oranos_category_id' => $oranosId]);
                }

                $synced++;
            } catch (\Throwable $e) {
                $failed++;
                Log::warning('Failed to sync Oranos category', ['oranos_id' => $categoryData['id'] ?? null, 'error' => $e->getMessage()]);
            }
        }

        $this->info("Synced {$synced} categories. Failed: {$failed}. Categories updated: {$categoriesUpdated}.");

        return 0;
    }
}
