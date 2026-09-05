import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch, updateBalance } from '@/store';
import { vipApi, transactionApi } from '@/api/client';
import EmptyState from '@/components/EmptyState';
import PageTransition from '@/components/PageTransition';
import { formatPrice, formatDateTime } from '@/utils/format';
import { useI18n } from '@/i18n';
import Breadcrumbs from '@/components/Breadcrumbs';

const QUICK_ACTIONS = [
  { to: '/dashboard/deposit', label: 'admin.depositFunds', icon: 'deposit', color: 'accent' },
  { to: '/dashboard/withdraw', label: 'admin.withdraw', icon: 'withdraw', color: 'secondary' },
  { to: '/dashboard/vip', label: 'admin.vipStatus', icon: 'vip', color: 'secondary' },
  { to: '/dashboard/manual-services', label: 'admin.manualServices', icon: 'service', color: 'secondary' },
  { to: '/dashboard/orders', label: 'admin.myOrders', icon: 'orders', color: 'secondary' },
];

const ACTION_ICONS: Record<string, ReactNode> = {
  deposit: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  ),
  withdraw: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  vip: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  service: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  orders: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  ),
};

function stagger(i: number) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  };
}

export default function Dashboard() {
  const { t } = useI18n();
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [vip, setVip] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => {
    vipApi.status()
      .then((r) => {
        setVip(r.data);
        dispatch(updateBalance(r.data.balance?.toString() ?? '0'));
      })
      .catch(console.error);
    transactionApi.list()
      .then((r) => setTxns(r.data.data ?? []))
      .catch(console.error);
  }, []);

  return (
    <PageTransition className="space-y-10">

      <Breadcrumbs items={[{ label: t('nav.home'), link: '/' }, { label: t('nav.dashboard') }]} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-h1 text-gray-900 dark:text-ink-900">{user?.name ?? 'User'}</h1>
        </div>
        <div className="text-right">
          <p className="text-micro text-gray-500 dark:text-ink-500 uppercase">{t('account.balance')}</p>
          <p className="text-h2 text-accent-400 tabular-nums">
            {formatPrice(user?.balance ?? 0)}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: t('account.balance'),
            value: formatPrice(user?.balance ?? 0),
            sub: null,
            color: 'accent',
          },
          {
            label: 'VIP Level',
            value: vip?.label ?? '—',
            sub: vip?.withdrawal_limit > 0 ? `${t('admin.withdrawals')}: $${vip.withdrawal_limit}` : null,
            color: 'vip',
          },
          {
            label: t('admin.thisMonth'),
            value: `${txns.filter((t) => new Date(t.created_at).getMonth() === new Date().getMonth()).length}`,
            sub: t('admin.recentOrders'),
            color: 'neutral',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            {...stagger(i)}
            className="card-pad"
          >
            <p className="text-micro text-gray-500 dark:text-ink-500 uppercase tracking-wide mb-2">{kpi.label}</p>
            <p
              className={`text-h2 ${
                kpi.color === 'accent'
                  ? 'text-accent-400'
                  : kpi.color === 'vip'
                  ? 'text-status-vip'
                  : 'text-gray-900 dark:text-ink-900'
              }`}
            >
              {kpi.value}
            </p>
            {kpi.sub && <p className="text-micro text-gray-500 dark:text-ink-500 mt-1">{kpi.sub}</p>}
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-h3 text-gray-900 dark:text-ink-900 mb-4">{t('admin.quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div key={a.to} {...stagger(i)} className="flex items-center justify-center">
              <Link
                to={a.to}
                className={`card-hover flex flex-col items-center justify-center gap-3 p-4 text-center w-full ${
                  a.color === 'accent' ? 'border-accent-500/30 bg-accent-500/5' : ''
                }`}
              >
                <span className={a.color === 'accent' ? 'text-accent-400' : 'text-gray-500 dark:text-ink-600'}>
                  {ACTION_ICONS[a.icon]}
                </span>
                <span className="text-small font-medium text-gray-900 dark:text-ink-900">{t(a.label)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card-pad">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-h3 text-gray-900 dark:text-ink-900">{t('admin.recentTransactions')}</h2>
          <Link to="/dashboard/orders" className="text-micro text-accent-400 hover:text-accent-300">
            {t('home.viewAll')} →
          </Link>
        </div>
        {txns.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.type')}</th>
                <th>{t('admin.amount')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody>
              {txns.slice(0, 10).map((t) => {
                const isPositive = ['deposit', 'refund', 'vip_upgrade'].includes(t.type);
                return (
                  <tr key={t.id}>
                    <td className="capitalize text-gray-900 dark:text-ink-800">{t.type.replace('_', ' ')}</td>
                    <td className={`font-semibold tabular-nums ${isPositive ? 'text-accent-400' : 'text-status-rejected'}`}>
                      {isPositive ? '+' : '-'}{formatPrice(t.amount)}
                    </td>
                    <td><span className={`badge-${t.status}`}>{t.status}</span></td>
                    <td className="text-gray-500 dark:text-ink-500">{formatDateTime(t.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" strokeLinecap="round" />
              </svg>
            }
            title={t('admin.noTransactionsYet')}
            description={t('admin.purchaseHistory')}
            action={{ label: t('home.browseProducts'), to: '/products' }}
          />
        )}
      </div>

    </PageTransition>
  );
}
