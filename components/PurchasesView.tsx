import { formatCurrency, getItemDisplayName } from '@/lib/data';
import type { Translate } from '@/lib/i18n';
import type { Item, Lang, ModalName, Purchase } from '@/lib/types';

interface PurchasesViewProps {
  purchases: Purchase[];
  items: Item[];
  lang: Lang;
  t: Translate;
  onOpenModal: (modal: ModalName) => void;
}

export default function PurchasesView({ purchases, items, lang, t, onOpenModal }: PurchasesViewProps) {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onOpenModal('purchase')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition"
        >
          {t('btnRecordPurchase')}
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase">
            <tr>
              <th className="py-3 px-4">{t('colPoNo')}</th>
              <th className="py-3 px-4">{t('colDate')}</th>
              <th className="py-3 px-4">{t('colSupplier')}</th>
              <th className="py-3 px-4">{t('colItemName')}</th>
              <th className="py-3 px-4">{t('colQty')}</th>
              <th className="py-3 px-4">{t('colUnitCost')}</th>
              <th className="py-3 px-4">{t('colTotal')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((purchase) => {
              const item = itemsById.get(purchase.itemId);
              return (
                <tr key={purchase.id}>
                  <td className="py-3 px-4 font-medium text-slate-700">{purchase.poNo}</td>
                  <td className="py-3 px-4">{purchase.date}</td>
                  <td className="py-3 px-4">{purchase.supplier}</td>
                  <td className={`py-3 px-4 ${lang === 'km' ? 'khmer-font' : ''}`}>
                    {item ? getItemDisplayName(item, lang) : '—'}
                  </td>
                  <td className="py-3 px-4">{purchase.qty}</td>
                  <td className="py-3 px-4">{formatCurrency(purchase.unitCost)}</td>
                  <td className="py-3 px-4 font-semibold">
                    {formatCurrency(purchase.qty * purchase.unitCost)}
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
