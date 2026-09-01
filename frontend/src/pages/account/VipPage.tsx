import { useEffect, useState } from 'react';
import { vipApi } from '@/api/client';
import { useAppSelector } from '@/store';
import toast from 'react-hot-toast';

export default function VipPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [vip, setVip] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    vipApi.status().then((r) => setVip(r.data)).catch(console.error);
  }, []);

  const handleUpgrade = async (target: string) => {
    if (!confirm(`Upgrade to ${target.toUpperCase()}? This will deduct $${vip?.upgrade_prices?.[target]} from your balance.`)) return;
    setUpgrading(true);
    try {
      await vipApi.upgrade(target);
      toast.success(`Upgraded to ${target.toUpperCase()}!`);
      const res = await vipApi.status();
      setVip(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  const tiers = [
    { key: 'none', label: 'Regular', limit: '$0', fee: '5%', price: null },
    { key: 'vip1', label: 'VIP 1', limit: `$${vip?.withdrawal_limit ?? 1000}`, fee: '3%', price: vip?.upgrade_prices?.vip1 },
    { key: 'vip2', label: 'VIP 2', limit: `$${vip?.withdrawal_limit ?? 2000}`, fee: '1.5%', price: vip?.upgrade_prices?.vip2 },
  ];

  const currentIndex = tiers.findIndex((t) => t.key === (user as any)?.vip_level);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">VIP Status</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, idx) => {
          const isCurrent = tier.key === (user as any)?.vip_level;
          const canUpgrade = idx > currentIndex;
          return (
            <div key={tier.key} className={`card text-center ${isCurrent ? 'ring-2 ring-primary-500' : ''}`}>
              <h3 className="text-xl font-bold">{tier.label}</h3>
              {isCurrent && <span className="badge-vip">Current</span>}
              <div className="mt-4 space-y-2 text-sm">
                <p>Withdrawal Limit: <strong>{tier.limit}</strong></p>
                <p>Withdrawal Fee: <strong>{tier.fee}</strong></p>
                {tier.price && <p>Upgrade Price: <strong>${tier.price}</strong></p>}
              </div>
              {canUpgrade && tier.price > 0 && (
                <button
                  onClick={() => handleUpgrade(tier.key)}
                  disabled={upgrading}
                  className="btn-primary mt-4 w-full"
                >
                  {upgrading ? 'Upgrading…' : `Upgrade to ${tier.label}`}
                </button>
              )}
              {isCurrent && <p className="text-sm text-green-600 mt-2">✓ This is your current tier</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
