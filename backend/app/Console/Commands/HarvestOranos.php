<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class HarvestOranos extends Command
{
    protected $signature = 'oranos:harvest {--update : Write findings to DB}';
    protected $description = 'Harvest all category images, product images, and category tree from Oranos';

    public function handle(): int
    {
        $base  = rtrim(config('services.oranos.url'), '/');
        $token = config('services.oranos.token');
        $http  = fn() => Http::withHeader('api-token', $token)->timeout(120)->connectTimeout(30);

        // 1) All category IDs
        $this->info('Fetching category list...');
        $cats = $http()->get("$base/client/api/categories")->json();
        $this->info('Categories: '.count($cats));

        $tree        = []; // id => [name, parent_id, photo, products_count]
        $catPhotos   = []; // oranos_cat_id => image URL
        $prodPhotos  = []; // oranos_product_id => image URL
        $prodFallback= []; // oranos_product_id => category_photo URL

        foreach ($cats as $i => $c) {
            $oid = $c['id'];
            if ($i % 25 === 0) {
                $this->line(sprintf('[%d/%d] cat #%d  tree=%d  catImg=%d  prodImg=%d',
                    $i, count($cats), $oid, count($tree), count($catPhotos), count($prodPhotos)));
            }

            try {
                $r = $http()->get("$base/api/category/products/$oid?lang=ar");
                if (!$r->successful()) continue;
                $j = $r->json();
                $d = $j['data'] ?? [];

                // Category's own photo — from itself or from children
                if (!empty($d['category_photo'])) {
                    $catPhotos[$oid] = $this->url($d['category_photo']);
                }

                // Child categories → tree + photo
                foreach (($d['categories'] ?? []) as $sc) {
                    $tree[$sc['id']] = [
                        'id'             => $sc['id'],
                        'name'           => $sc['name'],
                        'parent_id'      => $sc['parent_id'] ?? null,
                        'parent_name'    => $sc['parent_name'] ?? null,
                        'photo'          => $sc['photo'] ?? null,
                        'products_count' => $sc['products_count'] ?? 0,
                    ];
                    if (!empty($sc['photo'])) {
                        $catPhotos[$sc['id']] = $this->url($sc['photo']);
                    }
                }

                // Products → own photo + category fallback
                foreach (($d['products'] ?? []) as $p) {
                    $pid = $p['id'] ?? null;
                    if (!$pid) continue;

                    if (!empty($p['photo'])) {
                        $u = $this->url($p['photo']);
                        if (!str_contains($u, 'empty.png')) $prodPhotos[$pid] = $u;
                    }
                    if (!empty($p['category_photo'])) {
                        $u = $this->url($p['category_photo']);
                        if (!str_contains($u, 'empty.png')) $prodFallback[$pid] = $u;
                    }
                    if (!empty($p['category_id']) && !empty($p['category_photo'])) {
                        $cid = $p['category_id'];
                        if (empty($catPhotos[$cid])) $catPhotos[$cid] = $this->url($p['category_photo']);
                    }
                }
            } catch (\Throwable $e) {
                $this->warn("  #$oid: ".$e->getMessage());
            }
        }

        // Save raw harvest
        $dump = [
            'harvested_at' => now()->toIso8601String(),
            'tree'         => $tree,
            'catPhotos'    => $catPhotos,
            'prodPhotos'   => $prodPhotos,
            'prodFallback' => $prodFallback,
        ];
        file_put_contents(storage_path('app/oranos-harvest.json'),
            json_encode($dump, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        $this->newLine();
        $this->info('=== HARVEST COMPLETE ===');
        $this->info('Category tree nodes:      '.count($tree));
        $this->info('Category photos found:    '.count($catPhotos));
        $this->info('Product photos found:     '.count($prodPhotos));
        $this->info('Product fallbacks found:  '.count($prodFallback));
        $this->info('Saved to storage/app/oranos-harvest.json');

        if (!$this->option('update')) return 0;

        // 2) Apply to DB
        $this->newLine();
        $this->info('=== APPLYING TO DATABASE ===');

        $cu = $pu = $fu = 0;

        foreach (Category::whereNotNull('oranos_category_id')->get() as $cat) {
            $oid = $cat->oranos_category_id;
            $url = $catPhotos[$oid] ?? null;
            if ($url && $cat->image_url !== $url) {
                $cat->update(['image_url' => $url]);
                $cu++;
            }
        }

        foreach (Product::whereNotNull('oranos_product_id')->get() as $prod) {
            $oid = $prod->oranos_product_id;
            if (isset($prodPhotos[$oid])) {
                if ($prod->image_url !== $prodPhotos[$oid]) {
                    $prod->update(['image_url' => $prodPhotos[$oid]]);
                    $pu++;
                }
            } elseif (isset($prodFallback[$oid]) && !str_contains((string)$prod->image_url, '/images/')) {
                $prod->update(['image_url' => $prodFallback[$oid]]);
                $fu++;
            }
        }

        $this->info("Categories updated: $cu");
        $this->info("Products updated (own photo): $pu");
        $this->info("Products updated (fallback): $fu");

        return 0;
    }

    private function url(string $p): string
    {
        return str_starts_with($p, 'http') ? $p : "https://api.oranosmarket.com/$p";
    }
}
