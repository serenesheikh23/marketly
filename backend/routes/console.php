<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─── Oranos daily sync ─────────────────────────────────────────────
// Staggered so they don't collide on the same minute.
// All times are the server's timezone (Railway is usually UTC).

Schedule::command('oranos:sync-categories')
    ->dailyAt('03:00')
    ->withoutOverlapping();

Schedule::command('oranos:sync-products')
    ->dailyAt('03:10')
    ->withoutOverlapping();

// Image + tree refresh — weekly, not daily. Images rarely change,
// and this one is slow (~4 min) and hits Oranos's rate limit hard.
Schedule::command('oranos:harvest --update')
    ->weeklyOn(0, '03:30')  // Sunday at 03:30
    ->withoutOverlapping();
