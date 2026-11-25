import type { Translate } from '@/lib/i18n';
import type { Lang, Tab } from '@/lib/types';

const pageTitleKey: Record<Tab, 'navDashboard' | 'navItems' | 'navStock' | 'navPurchases' | 'navSales'> = {
  dashboard: 'navDashboard',
  items: 'navItems',
  stock: 'navStock',
  purchases: 'navPurchases',
  sales: 'navSales',
};

const activeLangClass =
  'px-3 py-1 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-sm transition';
const inactiveLangClass =
  'px-3 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 transition';

interface HeaderProps {
  lang: Lang;
  activeTab: Tab;
  onLanguageChange: (lang: Lang) => void;
  t: Translate;
}

export default function Header({ lang, activeTab, onLanguageChange, t }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className={`text-xl font-bold text-slate-800 ${lang === 'km' ? 'khmer-font' : ''}`}>
          {t(pageTitleKey[activeTab])}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={lang === 'en' ? activeLangClass : inactiveLangClass}
            aria-pressed={lang === 'en'}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('km')}
            className={`${lang === 'km' ? activeLangClass : inactiveLangClass} khmer-font`}
            aria-pressed={lang === 'km'}
          >
            ភាសាខ្មែរ
          </button>
        </div>
      </div>
    </header>
  );
}
