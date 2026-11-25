import { getItemDisplayName, getStockStatus } from '@/lib/data';
import { statusLabelKeys, type Translate } from '@/lib/i18n';
import type { Lang, StockRow } from '@/lib/types';
import StatusBadge from './StatusBadge';

export default function StockView({ stockRows, lang, t }: { stockRows: StockRow[]; lang: Lang; t: Translate }) {
  return (
    <section className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase">
            <tr>
              <th className="py-3 px-4">{t('colSku')}</th>
              <th className="py-3 px-4">{t('colItemName')}</th>
              <th className="py-3 px-4">{t('colPurchasedQty')}</th>
              <th className="py-3 px-4">{t('colSoldQty')}</th>
              <th className="py-3 px-4">{t('colInStock')}</th>
              <th className="py-3 px-4">{t('colReorderLevel')}</th>
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
                  <td className="py-3 px-4">{row.totalPurchased}</td>
                  <td className="py-3 px-4">{row.totalSold}</td>
                  <td className="py-3 px-4 font-semibold">{row.available}</td>
                  <td className="py-3 px-4">{row.reorderLevel}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={status} label={t(statusLabelKeys[status])} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
