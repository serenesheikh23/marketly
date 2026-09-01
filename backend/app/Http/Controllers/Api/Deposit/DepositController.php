<?php

namespace App\Http\Controllers\Api\Deposit;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\DepositStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepositRequest;
use App\Models\Transaction;
use App\Services\PaymentGatewayManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    public function __construct(private readonly PaymentGatewayManager $gateways)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $deposits = Transaction::where('user_id', $request->user()->id)
            ->where('type', TransactionType::Deposit)
            ->latest()
            ->paginate(20);

        return response()->json($deposits);
    }

    public function store(StoreDepositRequest $request): JsonResponse
    {
        $method = $request->string('method')->toString();
        $amount = (float) $request->float('amount');

        $gateway = $this->gateways->driver($method);
        $depositData = $gateway->createDeposit($amount, 'USD', ['user_id' => $request->user()->id]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'type' => TransactionType::Deposit,
            'amount' => $amount,
            'fee' => 0,
            'status' => $method === 'cash_wallet'
                ? TransactionStatus::Pending
                : TransactionStatus::Pending,
            'method' => $method,
            'gateway_ref' => $depositData['reference'] ?? null,
            'meta' => $depositData,
        ]);

        return response()->json([
            'transaction' => $transaction,
            'deposit' => $depositData,
        ], 201);
    }

    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(['transaction' => $transaction]);
    }
}
