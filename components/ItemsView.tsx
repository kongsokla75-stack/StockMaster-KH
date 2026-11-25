import { formatCurrency } from '@/lib/data';
import type { Translate } from '@/lib/i18n';
import type { Item, ModalName } from '@/lib/types';

interface ItemsViewProps {
  items: Item[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  t: Translate;
  onOpenModal: (modal: ModalName) => void;
}

export default function ItemsView({ items, searchTerm, onSearchChange, t, onOpenModal }: ItemsViewProps) {
  const query = searchTerm.trim().toLowerCase();
  const visibleItems = items.filter((item) =>
    [item.sku, item.nameEn, item.nameKm].some((value) => value.toLowerCase().includes(query)),
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={() => onOpenModal('item')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition"
        >
          {t('btnAddItem')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase">
            <tr>
              <th className="py-3 px-4">{t('colSku')}</th>
              <th className="py-3 px-4">{t('colNameEn')}</th>
              <th className="py-3 px-4">{t('colNameKm')}</th>
              <th className="py-3 px-4">{t('colCategory')}</th>
              <th className="py-3 px-4">{t('colCostPrice')}</th>
              <th className="py-3 px-4">{t('colSellPrice')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleItems.map((item) => (
              <tr key={item.id}>
                <td className="py-3 px-4 font-medium text-slate-700">{item.sku}</td>
                <td className="py-3 px-4">{item.nameEn}</td>
                <td className="py-3 px-4 khmer-font">{item.nameKm}</td>
                <td className="py-3 px-4">{item.category}</td>
                <td className="py-3 px-4">{formatCurrency(item.costPrice)}</td>
                <td className="py-3 px-4">{formatCurrency(item.sellPrice)}</td>
              </tr>
            ))}
            {visibleItems.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 px-4 text-center text-slate-400">
                  {t('noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
