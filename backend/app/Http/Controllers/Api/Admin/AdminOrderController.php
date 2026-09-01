<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function __construct(private readonly OrderService $orders)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->boolean('manual')) {
            $query->whereHas('items.product', fn($q) => $q->where('type', 'manual'));
        }

        $orders = $query->latest()->paginate(25);

        return response()->json($orders);
    }

    public function pendingManual(): JsonResponse
    {
        $orders = Order::with(['user', 'items.product'])
            ->whereIn('status', ['pending', 'processing'])
            ->whereHas('items.product', fn($q) => $q->where('type', 'manual'))
            ->latest()
            ->paginate(25);

        return response()->json($orders);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,completed,rejected'],
            'notes' => ['nullable', 'string'],
        ]);

        match ($data['status']) {
            'completed' => $this->orders->markCompleted($order),
            'rejected' => $this->orders->markRejected($order, $request->string('notes')->toString()),
            'processing' => $this->orders->markProcessing($order),
            default => $order->update(['status' => $data['status']]),
        };

        return response()->json(['order' => $order->fresh(['items.product'])]);
    }
}
