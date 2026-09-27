<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class OranosMarketService
{
    protected string $base;
    protected ?string $token;

    public function __construct()
    {
        $this->base  = rtrim(config('services.oranos.url'), '/');
        $this->token = config('services.oranos.token');
    }

    protected function http()
    {
        $headers = [
            'api-token'       => $this->token,
            'Accept'          => 'application/json, text/plain, */*',
            'Accept-Language' => 'ar,en;q=0.9',
            'Referer'         => 'https://oranosmarket.com/',
            'Origin'          => 'https://oranosmarket.com',
            'User-Agent'      => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        ];
        return Http::withHeaders($headers)->timeout(120)->connectTimeout(30);
    }

    public function getCategories(): array
    {
        return $this->http()->get("{$this->base}/client/api/categories")->json() ?? [];
    }

    public function getProducts(): array
    {
        return $this->http()->get("{$this->base}/client/api/products")->json() ?? [];
    }

    public function getCategoryProducts(int $oranosCategoryId, string $lang = 'ar'): array
    {
        return $this->http()->get("{$this->base}/api/category/products/{$oranosCategoryId}?lang={$lang}")->json() ?? [];
    }

    public function getConfigs(string $lang = 'ar', string $currency = 'USD'): array
    {
        return $this->http()->get("{$this->base}/api/configs?lang={$lang}&currency={$currency}")->json() ?? [];
    }

    public function createOrder(int $productId, int $quantity, string $playerId, array $extraParams = []): array
    {
        $query = http_build_query(array_merge([
            'qty' => $quantity,
            'playerId' => $playerId,
            'order_uuid' => Str::random(32),
        ], $extraParams));

        try {
            $response = $this->http()->get("{$this->base}/client/api/newOrder/{$productId}/params?{$query}");
        } catch (\Exception $e) {
            Log::error('Oranos API createOrder failed', ['error' => $e->getMessage(), 'product_id' => $productId]);
            throw new RuntimeException('Oranos API request failed: '.$e->getMessage());
        }

        if (! $response->successful()) {
            Log::error('Oranos API createOrder error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'product_id' => $productId,
            ]);
            throw new RuntimeException('Oranos API error: '.$response->status());
        }

        return $response->json();
    }

    public function checkOrders(array $orderIds): array
    {
        $orders = rawurlencode(json_encode($orderIds));

        try {
            $response = $this->http()->get("{$this->base}/client/api/check?orders={$orders}");
        } catch (\Exception $e) {
            Log::error('Oranos API checkOrders failed', ['error' => $e->getMessage(), 'order_ids' => $orderIds]);
            throw new RuntimeException('Oranos API request failed: '.$e->getMessage());
        }

        if (! $response->successful()) {
            Log::error('Oranos API checkOrders error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new RuntimeException('Oranos API error: '.$response->status());
        }

        return $response->json();
    }
}
