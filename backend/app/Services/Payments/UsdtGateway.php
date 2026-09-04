<?php

namespace App\Services\Payments;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UsdtGateway implements PaymentGatewayInterface
{
    public function name(): string
    {
        return 'usdt';
    }

    public function createDeposit(float $amount, string $currency, array $meta = []): array
    {
        $reference = 'usdt_'.Str::uuid()->toString();
        $wallet = config('services.usdt.wallet');
        $memo = strtoupper(substr($reference, -8));

        Log::info('USDT deposit created', [
            'reference' => $reference,
            'amount' => $amount,
            'wallet' => $wallet,
            'memo' => $memo,
        ]);

        return [
            'method' => 'usdt',
            'reference' => $reference,
            'amount' => $amount,
            'currency' => 'USDT_BEP20',
            'wallet_address' => $wallet,
            'memo' => $memo,
            'qr_code' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='.urlencode("usdt:{$wallet}?memo={$memo}"),
            'instructions' => 'Send USDT (BEP-20) to the address above with the memo. Your balance will be credited after 1 confirmation.',
        ];
    }

    public function verifyWebhook(Request $request): array
    {
        $signature = $request->header('X-Usdt-Signature');
        $payload = $request->getContent();
        $secret = config('services.usdt.secret');

        $expected = hash_hmac('sha256', $payload, $secret);

        if (! hash_equals($expected, (string) $signature)) {
            return [
                'valid' => false,
                'amount' => 0.0,
                'reference' => null,
                'error' => 'Invalid signature',
            ];
        }

        $data = $request->json()->all();

        if (($data['status'] ?? null) !== 'confirmed') {
            return [
                'valid' => false,
                'amount' => 0.0,
                'reference' => null,
                'error' => 'Status is not confirmed',
            ];
        }

        $expected = (float) ($data['expected_amount'] ?? 0);
        $actual = (float) ($data['amount'] ?? 0);
        $tolerance = 0.01;

        if (abs($actual - $expected) > $tolerance) {
            return [
                'valid' => false,
                'amount' => 0.0,
                'reference' => null,
                'error' => 'Amount mismatch',
            ];
        }

        return [
            'valid' => true,
            'amount' => $actual,
            'reference' => $data['reference'] ?? null,
            'error' => null,
        ];
    }
}
