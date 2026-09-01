import { useEffect, useState } from 'react';
import { adminSettingsApi } from '@/api/client';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminSettingsApi.list().then((r) => setSettings(r.data.settings ?? {})).catch(console.error);
  }, []);

  const updateSetting = async (key: string, value: string, type = 'string') => {
    setSaving(true);
    try {
      await adminSettingsApi.update({ key, value, type });
      toast.success(`${key} updated.`);
      const r = await adminSettingsApi.list();
      setSettings(r.data.settings ?? {});
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  const renderSetting = (key: string, value: any) => {
    if (typeof value === 'string') {
      return (
        <div key={key} className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{key}</p>
          </div>
          <input
            type="text"
            className="input w-48"
            defaultValue={value}
            onBlur={(e) => updateSetting(key, e.target.value)}
          />
        </div>
      );
    }
    return null;
  };

  const groups: Record<string, string[]> = {
    vip: ['vip1_withdrawal_limit', 'vip2_withdrawal_limit', 'vip1_fee_percent', 'vip2_fee_percent', 'regular_fee_percent', 'vip1_upgrade_price', 'vip2_upgrade_price'],
    payment: ['binance_pay_key', 'binance_pay_secret', 'usdt_wallet_address'],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {Object.entries(groups).map(([group, keys]) => (
        <div key={group} className="card">
          <h2 className="text-lg font-bold capitalize mb-4">{group} Settings</h2>
          <div className="space-y-4">
            {keys.map((key) => {
              const value = (settings[group] ?? {})[key]?.value ?? '—';
              return renderSetting(key, value);
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
