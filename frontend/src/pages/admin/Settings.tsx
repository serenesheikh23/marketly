import { useEffect, useState } from 'react';
import { adminSettingsApi } from '@/api/client';
import toast from 'react-hot-toast';
import PageTransition from '@/components/PageTransition';
import { useI18n } from '@/i18n';

const GROUPS: Record<string, { labelKey: string; keys: string[] }> = {
  vip: {
    labelKey: 'admin.vipAndMembership',
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
    labelKey: 'admin.paymentProviders',
    keys: ['binance_pay_key', 'binance_pay_secret', 'usdt_wallet_address'],
  },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    adminSettingsApi.list()
      .then((r) => setSettings(r.data.settings ?? {}))
      .catch(console.error);
  }, []);

  const updateSetting = async (key: string, value: string) => {
    setSaving(true);
    try {
      await adminSettingsApi.update({ key, value, type: 'string' });
      toast.success(t('admin.updated', { key }));
      const r = await adminSettingsApi.list();
      setSettings(r.data.settings ?? {});
    } catch (err: any) { toast.error(err.response?.data?.message ?? t('common.failed')); }
    finally { setSaving(false); }
  };

  return (
    <PageTransition className="space-y-8">
      <div>
        <p className="eyebrow mb-1">{t('admin.system')}</p>
        <h1 className="text-h1 text-gray-900 dark:text-ink-900">{t('admin.settings')}</h1>
      </div>

      <div className="space-y-6">
        {Object.entries(GROUPS).map(([group, info]) => (
          <div key={group} className="card-pad">
            <h2 className="text-h3 text-gray-900 dark:text-ink-900 mb-5">{t(info.labelKey)}</h2>
            <div className="space-y-4">
              {info.keys.map((key) => {
                const value = (settings[group] ?? {})[key]?.value ?? '';
                return (
                  <div key={key} className="flex items-start gap-3">
                    <div className="w-48 flex-shrink-0 pt-1">
                      <p className="text-small font-medium text-gray-800 dark:text-ink-800 break-words">{key}</p>
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
