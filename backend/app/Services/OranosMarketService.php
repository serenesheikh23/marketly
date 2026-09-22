<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class OranosMarketService
{
    private string $baseUrl;

    private string $token;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.oranos.url'), '/');
        $this->token = config('services.oranos.token');
    }

    public function getProducts(): array
    {
        return $this->request('GET', '/client/api/products');
    }

    public function getCategories(): array
    {
        return $this->request('GET', '/client/api/categories');
    }

    public function getProfile(): array
    {
        return $this->request('GET', '/client/api/profile');
    }

    public function createOrder(int $productId, int $quantity, string $playerId, array $extraParams = []): array
    {
        $query = http_build_query(array_merge([
            'qty' => $quantity,
            'playerId' => $playerId,
            'order_uuid' => Str::random(32),
        ], $extraParams));

        return $this->request('GET', "/client/api/newOrder/{$productId}/params?{$query}");
    }

    public function checkOrders(array $orderIds): array
    {
        $orders = rawurlencode(json_encode($orderIds));

        return $this->request('GET', "/client/api/check?orders={$orders}");
    }

    private function request(string $method, string $path): array
    {
        try {
            $response = Http::withHeader('api-token', $this->token)
                ->timeout(600)
                ->connectTimeout(30)
                ->{$method}("{$this->baseUrl}{$path}");
        } catch (\Exception $e) {
            Log::error('Oranos API request failed', ['error' => $e->getMessage()]);
            throw new RuntimeException('Oranos API request failed: '.$e->getMessage());
        }

        if (! $response->successful()) {
            Log::error('Oranos API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new RuntimeException('Oranos API error: '.$response->status());
        }

        return $response->json();
    }
}
