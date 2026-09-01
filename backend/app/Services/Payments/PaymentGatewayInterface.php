<?php

namespace App\Services\Payments;

use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    public function name(): string;

    /**
     * @return array<string, mixed>  Data required by the frontend to complete the deposit (QR, address, etc.)
     */
    public function createDeposit(float $amount, string $currency, array $meta = []): array;

    /**
     * @return array{valid: bool, amount: float, reference: ?string, error: ?string}
     */
    public function verifyWebhook(Request $request): array;
}
