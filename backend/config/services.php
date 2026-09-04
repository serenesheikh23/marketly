<?php

return [
    'binance_pay' => [
        'key' => env('BINANCE_PAY_KEY'),
        'secret' => env('BINANCE_PAY_SECRET'),
    ],
    'usdt' => [
        'wallet' => env('USDT_WALLET_ADDRESS'),
        'secret' => env('USDT_WEBHOOK_SECRET'),
    ],
    'cloudinary' => [
        'url' => env('CLOUDINARY_URL'),
    ],
];
