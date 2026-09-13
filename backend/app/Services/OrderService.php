<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\OrderCompleted;
use App\Events\OrderCreated;
use App\Mail\OrderConfirmation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\OrderStatusChanged;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderService
{
    /**
     * @param  array<int, array{product_id: int, quantity: int, payload?: array<string, mixed>}>  $items
     * @param  array<string, mixed>  $meta  user-supplied payment metadata (Binance ID, USDT address, etc.)
     */
    public function createOrder(User $user, array $items, string $paymentMethod = 'cash_wallet', array $meta = []): Order
    {
        $order = DB::transaction(function () use ($user, $items, $paymentMethod, $meta) {
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
            $isManualOrder = collect($productMap)->every(fn ($i) => $i['product']->isManual());

            // For automatic orders paid with cash_wallet, debit immediately
            if (! $isManualOrder && $paymentMethod === 'cash_wallet' && (float) $user->balance < $total) {
                throw new \DomainException('Insufficient balance.');
            }

            $hasAutomation = collect($productMap)->contains(fn ($i) => $i['product']->is_automation);

            $status = $isManualOrder
                ? OrderStatus::Pending
                : ($hasAutomation ? OrderStatus::Processing : OrderStatus::Completed);

            // Generate payment_ref — wallet gets wallet-xxx; Binance/USDT get a simulated TX id
            $paymentRef = match ($paymentMethod) {
                'cash_wallet' => 'wallet-'.uniqid(),
                'binance_pay', 'usdt' => $this->simulatePaymentRef($paymentMethod, $meta, $total),
                default => null,
            };

            // Real payment mode returns null — order must wait for webhook confirmation.
            if (! $isManualOrder && in_array($paymentMethod, ['binance_pay', 'usdt']) && empty($paymentRef)) {
                $status = OrderStatus::Pending;
            }

            $order = Order::create([
                'user_id' => $user->id,
                'status' => $status,
                'subtotal' => $subtotal,
                'fee' => $fee,
                'total' => $total,
                'payment_method' => $paymentMethod,
                'payment_ref' => $paymentRef,
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
                } elseif (in_array($paymentMethod, ['binance_pay', 'usdt'])) {
                    // In real mode payment_ref is null — wait for webhook to create the transaction.
                    // In demo mode we create a simulated TX for admin visibility.
                    if ($order->payment_ref) {
                        Transaction::create([
                            'user_id' => $user->id,
                            'type' => TransactionType::Purchase,
                            'amount' => $total,
                            'fee' => 0,
                            'status' => TransactionStatus::Approved,
                            'method' => $paymentMethod,
                            'gateway_ref' => $order->payment_ref,
                            'meta' => [
                                'order_id' => $order->id,
                                'payment_meta' => $meta,
                            ],
                        ]);
                    }
                }

                if ($hasAutomation) {
                    $this->safeBroadcast(new OrderCreated($order));
                } else {
                    $this->safeBroadcast(new OrderCompleted($order));
                }
            } else {
                $this->safeBroadcast(new OrderCreated($order));
            }

            try {
                $user->notify(new OrderStatusChanged($order));
            } catch (\Throwable $e) {
                Log::warning('Notification failed (non-fatal)', [
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }

            try {
                Mail::to($user->email)->send(new OrderConfirmation($order));
            } catch (\Throwable $e) {
                Log::warning('Order confirmation email failed (non-fatal)', [
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $order->fresh(['items.product']);
        });

        // After commit — call Oranos for any automation items (outside the transaction).
        if ($order->items->contains(fn ($i) => $i->product?->is_automation)) {
            $this->forwardAutomationItems($order);
            $order = $order->fresh(['items.product']);
        }

        return $order;
    }

    private function forwardAutomationItems(Order $order): void
    {
        $svc = new OranosMarketService();

        $oranosIds = [];
        $oranosStatuses = [];
        $totalCommission = 0.0;
        $failed = [];

        foreach ($order->items as $item) {
            $product = $item->product;

            if (! $product
                || ! $product->is_automation
                || empty($product->oranos_product_id)
            ) {
                continue;
            }

            $params = is_array($item->payload) ? array_values($item->payload) : [];
            $playerId = (string) ($params[0] ?? '');
            $extra = array_slice($params, 1);

            try {
                $result = $svc->createOrder(
                    (int) $product->oranos_product_id,
                    (int) $item->quantity,
                    $playerId,
                    $extra,
                );

                $oranosIds[] = $result['data']['order_id']
                    ?? $result['order_id']
                    ?? null;

                $oranosStatuses[] = $result['data']['status']
                    ?? $result['status']
                    ?? 'pending';

                $totalCommission += ((float) $product->price - (float) $product->base_price)
                    * (int) $item->quantity;
            } catch (\Throwable $e) {
                Log::error('Oranos order failed', [
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'error' => $e->getMessage(),
                ]);

                $failed[] = $product->name . ': ' . $e->getMessage();
            }
        }

        if (empty($failed)) {
            $order->update([
                'oranos_order_id' => implode(',', array_filter($oranosIds)),
                'oranos_status' => implode(',', $oranosStatuses),
                'commission' => $totalCommission,
            ]);

            return;
        }

        // At least one Oranos call failed — refund the order locally and reject.
        DB::transaction(function () use ($order, $failed) {
            if ($order->payment_method === 'cash_wallet') {
                $order->user->increment('balance', (float) $order->total);
            }

            $order->update([
                'status' => OrderStatus::Rejected,
                'failure_reason' => implode(' | ', $failed),
            ]);
        });

        // Log any Oranos orders that did succeed — they must be reconciled manually.
        if (! empty($oranosIds)) {
            Log::warning('Partial Oranos success on rejected order — reconcile manually', [
                'order_id' => $order->id,
                'oranos_order_ids' => $oranosIds,
            ]);
        }
    }

    public function markCompleted(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->update(['status' => OrderStatus::Completed]);
            $this->safeBroadcast(new OrderCompleted($order));
            $order->user->notify(new OrderStatusChanged($order));
        });
    }

    private function safeBroadcast(object $event): void
    {
        try {
            event($event);
        } catch (\Throwable $e) {
            Log::warning('Broadcast failed (non-fatal)', [
                'event' => $event::class,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Call the gateway's simulatePayment and return the fake transaction id.
     * Returns null when the gateway is in real mode (simulation disabled).
     *
     * @param  array<string, mixed>  $meta
     * @return string|null null when real payment mode is active
     */
    private function simulatePaymentRef(string $paymentMethod, array $meta, float $total): ?string
    {
        $gateway = app(PaymentGatewayManager::class)->driver($paymentMethod);

        if (! $gateway->isDemoMode()) {
            // Real payment mode: order must wait for webhook confirmation.
            // Return null so createOrder sets status = Pending and ref = null.
            return null;
        }

        $result = $gateway->simulatePayment([...$meta, 'amount' => $total]);

        if (! ($result['success'] ?? false)) {
            Log::warning('Payment simulation returned failure', [
                'method' => $paymentMethod,
                'result' => $result,
            ]);

            return $paymentMethod.'_failed_'.uniqid();
        }

        return $result['transaction_id'] ?? $paymentMethod.'_'.uniqid();
    }

    public function markRejected(Order $order, ?string $reason = null): void
    {
        DB::transaction(function () use ($order, $reason) {
            $order->update([
                'status' => OrderStatus::Rejected,
                'notes' => $reason ? "Rejected: {$reason}" : $order->notes,
            ]);
            $this->safeBroadcast(new OrderCompleted($order));
            $order->user->notify(new OrderStatusChanged($order));
        });
    }

    public function markProcessing(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->update(['status' => OrderStatus::Processing]);
            $this->safeBroadcast(new OrderCompleted($order));
            $order->user->notify(new OrderStatusChanged($order));
        });
    }
}
