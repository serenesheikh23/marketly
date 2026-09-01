<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalUsers = User::count();
        $totalRevenue = Transaction::where('type', TransactionType::Purchase)
            ->where('status', TransactionStatus::Approved)
            ->sum('amount');

        $pendingDeposits = Transaction::where('type', TransactionType::Deposit)
            ->where('status', TransactionStatus::Pending)
            ->count();

        $pendingWithdrawals = Transaction::where('type', TransactionType::Withdrawal)
            ->where('status', TransactionStatus::Pending)
            ->count();

        $pendingManualOrders = Order::whereIn('status', [OrderStatus::Pending, OrderStatus::Processing])
            ->whereHas('items.product', fn($q) => $q->where('type', 'manual'))
            ->count();

        $recentOrders = Order::with('user')->latest()->limit(10)->get();

        $vipBreakdown = User::selectRaw('vip_level, COUNT(*) as count')
            ->groupBy('vip_level')
            ->pluck('count', 'vip_level');

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_revenue' => round($totalRevenue, 2),
                'pending_deposits' => $pendingDeposits,
                'pending_withdrawals' => $pendingWithdrawals,
                'pending_manual_orders' => $pendingManualOrders,
                'vip_breakdown' => $vipBreakdown,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
