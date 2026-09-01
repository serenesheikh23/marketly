<?php

namespace App\Services;

use App\Enums\CategoryType;
use App\Enums\OrderStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\OrderCompleted;
use App\Events\OrderCreated;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\OrderStatusChanged;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    /**
     * @param array<int, array{product_id: int, quantity: int, payload?: array<string, mixed>}> $items
     */
    public function createOrder(User $user, array $items, string $paymentMethod = 'cash_wallet'): Order
    {
        return DB::transaction(function () use ($user, $items, $paymentMethod) {
            $subtotal = 0.0;
            $productMap = [];

            foreach ($items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if (! $product->is_active) {
                    throw new \DomainException("Product {$product->name} is not available.");
                }

                if ($product->isManual() && empty($item['payload'])) {
                    throw new \DomainException("Manual product {$product->name} requires payload data.");
                }

                $qty = max(1, (int) $item['quantity']);
                $subtotal += (float) $product->price * $qty;
                $productMap[$product->id] = ['product' => $product, 'quantity' => $qty, 'payload' => $item['payload'] ?? null];
            }

            $fee = 0.0;
            $total = $subtotal + $fee;

            // Determine if this is fully manual
            $isManualOrder = collect($productMap)->every(fn($i) => $i['product']->isManual());

            // For automatic orders paid with cash_wallet, debit immediately
            if (! $isManualOrder && $paymentMethod === 'cash_wallet' && (float) $user->balance < $total) {
                throw new \DomainException('Insufficient balance.');
            }

            $status = $isManualOrder ? OrderStatus::Pending : OrderStatus::Completed;

            $order = Order::create([
                'user_id' => $user->id,
                'status' => $status,
                'subtotal' => $subtotal,
                'fee' => $fee,
                'total' => $total,
                'payment_method' => $paymentMethod,
                'payment_ref' => $paymentMethod !== 'cash_wallet' ? null : 'wallet-' . uniqid(),
            ]);

            foreach ($productMap as $productId => $data) {
                /** @var Product $product */
                $product = $data['product'];
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $data['quantity'],
                    'unit_price' => $product->price,
                    'payload' => $data['payload'],
                ]);

                if (! $product->isManual()) {
                    $product->decrement('stock', $data['quantity']);
                }
            }

            if (! $isManualOrder) {
                if ($paymentMethod === 'cash_wallet') {
                    $user->decrement('balance', $total);
                    Transaction::create([
                        'user_id' => $user->id,
                        'type' => TransactionType::Purchase,
                        'amount' => $total,
                        'fee' => 0,
                        'status' => TransactionStatus::Approved,
                        'method' => 'cash_wallet',
                        'gateway_ref' => $order->payment_ref,
                        'meta' => ['order_id' => $order->id],
                    ]);
                }

                event(new OrderCompleted($order));
            } else {
                event(new OrderCreated($order));
            }

            $user->notify(new OrderStatusChanged($order));

            return $order->fresh(['items.product']);
        });
    }

    public function markCompleted(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->update(['status' => OrderStatus::Completed]);
            event(new OrderCompleted($order));
            $order->user->notify(new OrderStatusChanged($order));
        });
    }

    public function markRejected(Order $order, ?string $reason = null): void
    {
        DB::transaction(function () use ($order, $reason) {
            $order->update([
                'status' => OrderStatus::Rejected,
                'notes' => $reason ? "Rejected: {$reason}" : $order->notes,
            ]);
            $order->user->notify(new OrderStatusChanged($order));
        });
    }

    public function markProcessing(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->update(['status' => OrderStatus::Processing]);
            $order->user->notify(new OrderStatusChanged($order));
        });
    }
}
