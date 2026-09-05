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
        $reference = 'binance_'.Str::uuid()->toString();

        Log::info('Binance Pay deposit created', [
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
        ]);

        return [
            'method' => 'binance_pay',
            'reference' => $reference,
            'amount' => $amount,
            'currency' => $currency,
            'qr_code' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=binance:'.urlencode($reference),
            'checkout_url' => 'https://pay.binance.com/checkout/'.$reference,
            'instructions' => 'Scan the QR code with Binance Pay to complete the payment.',
        ];
    }

    public function verifyWebhook(Request $request): array
    {
        $signature = $request->header('X-Binance-Signature');
        $payload = $request->getContent();
        $secret = config('services.binance_pay.secret');

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

    /**
     * Demo-mode simulator: returns a fake successful Binance Pay transaction.
     * No balance deduction, no external API call.
     */
    public function simulatePayment(array $meta = []): array
    {
        $txid = 'binance_'.strtoupper(Str::random(12));

        Log::info('Binance Pay simulated payment', [
            'transaction_id' => $txid,
            'account' => $meta['binance_id'] ?? $meta['binance_email'] ?? null,
            'amount' => $meta['amount'] ?? null,
        ]);

        return [
            'success' => true,
            'transaction_id' => $txid,
            'status' => 'SUCCESS',
            'method' => 'binance_pay',
            'account' => $meta['binance_id'] ?? $meta['binance_email'] ?? null,
            'error' => null,
        ];
    }
}
