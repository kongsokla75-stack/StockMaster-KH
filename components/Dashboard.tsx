import { formatCurrency, getItemDisplayName, getStockStatus } from '@/lib/data';
import { statusLabelKeys, type Translate } from '@/lib/i18n';
import type { Lang, ModalName, Sale, StockRow } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface DashboardProps {
  stockRows: StockRow[];
  sales: Sale[];
  lang: Lang;
  t: Translate;
  onOpenModal: (modal: ModalName) => void;
}

export default function Dashboard({ stockRows, sales, lang, t, onOpenModal }: DashboardProps) {
  const stockValue = stockRows.reduce((sum, row) => sum + row.available * row.costPrice, 0);
  const salesRevenue = sales.reduce((sum, sale) => sum + sale.qty * sale.unitPrice, 0);
  const lowStockCount = stockRows.filter(
    (row) => getStockStatus(row.available, row.reorderLevel) !== 'healthy',
  ).length;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">{t('kpiTotalItems')}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stockRows.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">{t('kpiStockValue')}</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(stockValue)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">{t('kpiTotalSales')}</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(salesRevenue)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">{t('kpiLowStock')}</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">{t('quickOverview')}</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenModal('purchase')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              {t('btnRecordPurchase')}
            </button>
            <button
              type="button"
              onClick={() => onOpenModal('sale')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
            >
              {t('btnRecordSale')}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                <th className="py-3 px-4">{t('colSku')}</th>
                <th className="py-3 px-4">{t('colItemName')}</th>
                <th className="py-3 px-4">{t('colInStock')}</th>
                <th className="py-3 px-4">{t('colStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockRows.map((row) => {
                const status = getStockStatus(row.available, row.reorderLevel);
                return (
                  <tr key={row.id}>
                    <td className="py-3 px-4 font-medium text-slate-700">{row.sku}</td>
                    <td className={`py-3 px-4 ${lang === 'km' ? 'khmer-font' : ''}`}>
                      {getItemDisplayName(row, lang)}
                    </td>
                    <td className="py-3 px-4">{row.available}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={status} label={t(statusLabelKeys[status])} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
