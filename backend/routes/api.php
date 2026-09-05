<?php

use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminTransactionController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Category\CategoryController;
use App\Http\Controllers\Api\Deposit\DepositController;
use App\Http\Controllers\Api\Order\OrderController;
use App\Http\Controllers\Api\Product\ProductController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\Vip\VipController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\Withdrawal\WithdrawalController;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public auth
Route::middleware('throttle:register')->post('/auth/register', [AuthController::class, 'register']);
Route::middleware('throttle:login')->post('/auth/login', [AuthController::class, 'login']);

// Public content
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/categories/{slug}/form-schema', [CategoryController::class, 'formSchema']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Public settings (company info, legal pages)
Route::get('/settings/company', [SettingsController::class, 'company']);
Route::get('/settings/legal/{page}', [SettingsController::class, 'legal']);

// Webhooks (no auth)
Route::post('/webhooks/payments/{gateway}', [WebhookController::class, 'handle']);

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    // Deposits & Withdrawals
    Route::get('/deposits', [DepositController::class, 'index']);
    Route::post('/deposits', [DepositController::class, 'store']);
    Route::get('/deposits/{transaction}', [DepositController::class, 'show']);

    Route::get('/withdrawals', [WithdrawalController::class, 'index']);
    Route::post('/withdrawals', [WithdrawalController::class, 'store']);
    Route::get('/withdrawals/{transaction}', [WithdrawalController::class, 'show']);

    // VIP
    Route::get('/vip/status', [VipController::class, 'status']);
    Route::post('/vip/upgrade', [VipController::class, 'upgrade']);

    // User transactions list
    Route::get('/transactions', function (Request $request) {
        return Transaction::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);
    });
});

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin|moderator'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'stats']);
    Route::get('/health', [AdminDashboardController::class, 'health']);

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::patch('/products/{product}', [AdminProductController::class, 'update']);
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);

    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::patch('/categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);
    Route::post('/categories/{category}/fields', [AdminCategoryController::class, 'storeField']);
    Route::delete('/fields/{field}', [AdminCategoryController::class, 'destroyField']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/pending-manual', [AdminOrderController::class, 'pendingManual']);
    Route::get('/orders/pending-manual/count', [AdminOrderController::class, 'pendingManualCount']);
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

    Route::get('/deposits', [AdminTransactionController::class, 'deposits']);
    Route::get('/deposits/{transaction}', [AdminTransactionController::class, 'deposits']);
    Route::post('/deposits/{transaction}/approve', [AdminTransactionController::class, 'approveDeposit']);
    Route::post('/deposits/{transaction}/reject', [AdminTransactionController::class, 'rejectDeposit']);

    Route::get('/withdrawals', [AdminTransactionController::class, 'withdrawals']);
    Route::get('/withdrawals/{transaction}', [AdminTransactionController::class, 'withdrawals']);
    Route::post('/withdrawals/{transaction}/approve', [AdminTransactionController::class, 'approveWithdrawal']);
    Route::post('/withdrawals/{transaction}/reject', [AdminTransactionController::class, 'rejectWithdrawal']);

    // Settings — admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::post('/settings', [AdminSettingsController::class, 'update']);
        Route::post('/settings/bulk', [AdminSettingsController::class, 'bulkUpdate']);
        Route::put('/settings/company', [AdminSettingsController::class, 'updateCompany']);
        Route::put('/settings/legal/{page}', [AdminSettingsController::class, 'updateLegal']);
    });
});
