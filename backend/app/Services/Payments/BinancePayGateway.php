<?php

namespace App\Services\Payments;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BinancePayGateway implements PaymentGatewayInterface
{
    public function name(): string
    {
        return 'binance_pay';
    }

    public function createDeposit(float $amount, string $currency, array $meta = []): array
    {
        $reference = 'binance_' . Str::uuid()->toString();

        Log::info('Binance Pay mock deposit created', [
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
        ]);

        return [
            'method' => 'binance_pay',
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'qr_code' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=binance:' . urlencode($reference),
            'checkout_url' => 'https://pay.binance.com/checkout/' . $reference,
            'instructions' => 'Scan the QR code with Binance Pay to complete the payment.',
        ];
    }

    public function verifyWebhook(Request $request): array
    {
        $signature = $request->header('X-Binance-Signature');
        $payload = $request->getContent();
        $secret = config('services.binance_pay.secret', 'MOCK_BINANCE_SECRET');

        $expected = hash_hmac('sha512', $payload, $secret);

        if (! hash_equals($expected, (string) $signature)) {
            return [
                'valid' => false,
                'amount' => 0.0,
                'reference' => null,
                'error' => 'Invalid signature',
            ];
        }

        $data = $request->json()->all();

        if (($data['status'] ?? null) !== 'PAID') {
            return [
                'valid' => false,
                'amount' => 0.0,
                'reference' => null,
                'error' => 'Status is not PAID',
            ];
        }

        return [
            'valid' => true,
            'amount' => (float) ($data['amount'] ?? 0),
            'reference' => $data['reference'] ?? null,
            'error' => null,
        ];
    }
}
