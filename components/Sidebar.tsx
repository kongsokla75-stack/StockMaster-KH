import type { Translate } from '@/lib/i18n';
import type { Lang, Tab } from '@/lib/types';

const navItems: { tab: Tab; icon: string; label: 'navDashboard' | 'navItems' | 'navStock' | 'navPurchases' | 'navSales' }[] = [
  { tab: 'dashboard', icon: '📊', label: 'navDashboard' },
  { tab: 'items', icon: '📦', label: 'navItems' },
  { tab: 'stock', icon: '🏭', label: 'navStock' },
  { tab: 'purchases', icon: '📥', label: 'navPurchases' },
  { tab: 'sales', icon: '📤', label: 'navSales' },
];

const activeClass =
  'nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white transition';
const inactiveClass =
  'nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition';

interface SidebarProps {
  lang: Lang;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  t: Translate;
}

export default function Sidebar({ lang, activeTab, onTabChange, t }: SidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0">
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-400">{t('appTitle')}</h1>
            <p className="text-xs text-slate-400">{t('appSubtitle')}</p>
          </div>
        </div>

        <nav className="p-3 space-y-1" aria-label="Main navigation">
          {navItems.map(({ tab, icon, label }) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              data-tab={tab}
              className={activeTab === tab ? activeClass : inactiveClass}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              <span aria-hidden="true">{icon}</span>
              <span className={lang === 'km' ? 'khmer-font' : undefined}>{t(label)}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <p className={lang === 'km' ? 'khmer-font' : undefined}>{t('footerNote')}</p>
      </div>
    </aside>
  );
}
