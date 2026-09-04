import { useEffect, useState } from 'react';
import { adminSettingsApi } from '@/api/client';
import toast from 'react-hot-toast';
import PageTransition from '@/components/PageTransition';

const GROUPS: Record<string, { label: string; keys: string[] }> = {
  vip: {
    label: 'VIP & Membership',
    keys: [
      'vip1_withdrawal_limit',
      'vip2_withdrawal_limit',
      'vip1_fee_percent',
      'vip2_fee_percent',
      'regular_fee_percent',
      'vip1_upgrade_price',
      'vip2_upgrade_price',
    ],
  },
  payment: {
    label: 'Payment Providers',
    keys: ['binance_pay_key', 'binance_pay_secret', 'usdt_wallet_address'],
  },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminSettingsApi.list()
      .then((r) => setSettings(r.data.settings ?? {}))
      .catch(console.error);
  }, []);

  const updateSetting = async (key: string, value: string) => {
    setSaving(true);
    try {
      await adminSettingsApi.update({ key, value, type: 'string' });
      toast.success(`${key} updated.`);
      const r = await adminSettingsApi.list();
      setSettings(r.data.settings ?? {});
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <PageTransition className="space-y-8">
      <div>
        <p className="eyebrow mb-1">System</p>
        <h1 className="text-h1 text-ink-900">Settings</h1>
      </div>

      <div className="space-y-6">
        {Object.entries(GROUPS).map(([group, info]) => (
          <div key={group} className="card-pad">
            <h2 className="text-h3 text-ink-900 mb-5">{info.label}</h2>
            <div className="space-y-4">
              {info.keys.map((key) => {
                const value = (settings[group] ?? {})[key]?.value ?? '';
                return (
                  <div key={key} className="flex items-start gap-3">
                    <div className="w-48 flex-shrink-0 pt-1">
                      <p className="text-small font-medium text-ink-800 break-words">{key}</p>
                    </div>
                    <input
                      type="text"
                      className="input flex-1"
                      defaultValue={value}
                      disabled={saving}
                      onBlur={(e) => {
                        if (e.target.value !== value) updateSetting(key, e.target.value);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}
