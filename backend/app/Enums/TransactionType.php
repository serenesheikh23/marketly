<?php

namespace App\Enums;

enum TransactionType: string
{
    case Deposit = 'deposit';
    case Withdrawal = 'withdrawal';
    case Purchase = 'purchase';
    case Refund = 'refund';
    case VipUpgrade = 'vip_upgrade';

    public function label(): string
    {
        return match ($this) {
            self::Deposit => 'Deposit',
            self::Withdrawal => 'Withdrawal',
            self::Purchase => 'Purchase',
            self::Refund => 'Refund',
            self::VipUpgrade => 'VIP Upgrade',
        };
    }
}
