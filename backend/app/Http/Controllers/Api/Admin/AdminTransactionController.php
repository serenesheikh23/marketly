<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\DepositStatusChanged;
use App\Events\WithdrawalStatusChanged;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTransactionController extends Controller
{
    public function deposits(Request $request): JsonResponse
    {
        $query = Transaction::with('user')
            ->where('type', TransactionType::Deposit);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $deposits = $query->latest()->paginate(25);
        return response()->json($deposits);
    }

    public function withdrawals(Request $request): JsonResponse
    {
        $query = Transaction::with('user')
            ->where('type', TransactionType::Withdrawal);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $withdrawals = $query->latest()->paginate(25);
        return response()->json($withdrawals);
    }

    public function approveDeposit(Transaction $transaction): JsonResponse
    {
        if ($transaction->type !== TransactionType::Deposit) {
            return response()->json(['message' => 'Not a deposit.'], 422);
        }

        $user = $transaction->user;
        $user->increment('balance', $transaction->amount);
        $transaction->update(['status' => TransactionStatus::Approved]);

        event(new DepositStatusChanged($transaction));

        return response()->json(['transaction' => $transaction->fresh()]);
    }

    public function rejectDeposit(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->type !== TransactionType::Deposit) {
            return response()->json(['message' => 'Not a deposit.'], 422);
        }

        $transaction->update([
            'status' => TransactionStatus::Rejected,
            'notes' => $request->string('reason')->toString(),
        ]);

        event(new DepositStatusChanged($transaction));

        return response()->json(['transaction' => $transaction->fresh()]);
    }

    public function approveWithdrawal(Transaction $transaction): JsonResponse
    {
        if ($transaction->type !== TransactionType::Withdrawal) {
            return response()->json(['message' => 'Not a withdrawal.'], 422);
        }

        $transaction->update(['status' => TransactionStatus::Approved]);
        event(new WithdrawalStatusChanged($transaction));

        return response()->json(['transaction' => $transaction->fresh()]);
    }

    public function rejectWithdrawal(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->type !== TransactionType::Withdrawal) {
            return response()->json(['message' => 'Not a withdrawal.'], 422);
        }

        $user = $transaction->user;
        $user->increment('balance', $transaction->amount);

        $transaction->update([
            'status' => TransactionStatus::Rejected,
            'notes' => $request->string('reason')->toString(),
        ]);

        event(new WithdrawalStatusChanged($transaction));

        return response()->json(['transaction' => $transaction->fresh()]);
    }
}
