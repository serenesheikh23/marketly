<?php

namespace App\Enums;

enum VipLevel: string
{
    case None = 'none';
    case Vip1 = 'vip1';
    case Vip2 = 'vip2';

    public function label(): string
    {
        return match ($this) {
            self::None => 'Regular',
            self::Vip1 => 'VIP 1',
            self::Vip2 => 'VIP 2',
        };
    }

    public function defaultWithdrawalLimit(): float
    {
        return match ($this) {
            self::None => 0.0,
            self::Vip1 => 1000.0,
            self::Vip2 => 2000.0,
        };
    }

    public function defaultFeePercent(): float
    {
        return match ($this) {
            self::None => 5.0,
            self::Vip1 => 3.0,
            self::Vip2 => 1.5,
        };
    }
}
