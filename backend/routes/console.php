<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$log = storage_path('logs/oranos-sync.log');

Schedule::command('oranos:sync-categories')
    ->dailyAt('03:00')
    ->withoutOverlapping()
    ->appendOutputTo($log);

Schedule::command('oranos:sync-products')
    ->dailyAt('03:10')
    ->withoutOverlapping()
    ->appendOutputTo($log);

Schedule::command('oranos:harvest --update')
    ->weeklyOn(0, '03:30')
    ->withoutOverlapping()
    ->appendOutputTo($log);
