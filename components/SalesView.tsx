import { formatCurrency, getItemDisplayName } from '@/lib/data';
import type { Translate } from '@/lib/i18n';
import type { Item, Lang, ModalName, Sale } from '@/lib/types';

interface SalesViewProps {
  sales: Sale[];
  items: Item[];
  lang: Lang;
  t: Translate;
  onOpenModal: (modal: ModalName) => void;
}

export default function SalesView({ sales, items, lang, t, onOpenModal }: SalesViewProps) {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onOpenModal('sale')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
        >
          {t('btnRecordSale')}
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase">
            <tr>
              <th className="py-3 px-4">{t('colInvNo')}</th>
              <th className="py-3 px-4">{t('colDate')}</th>
              <th className="py-3 px-4">{t('colCustomer')}</th>
              <th className="py-3 px-4">{t('colItemName')}</th>
              <th className="py-3 px-4">{t('colQty')}</th>
              <th className="py-3 px-4">{t('colSellPrice')}</th>
              <th className="py-3 px-4">{t('colTotal')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => {
              const item = itemsById.get(sale.itemId);
              return (
                <tr key={sale.id}>
                  <td className="py-3 px-4 font-medium text-slate-700">{sale.invNo}</td>
                  <td className="py-3 px-4">{sale.date}</td>
                  <td className="py-3 px-4">{sale.customer}</td>
                  <td className={`py-3 px-4 ${lang === 'km' ? 'khmer-font' : ''}`}>
                    {item ? getItemDisplayName(item, lang) : '—'}
                  </td>
                  <td className="py-3 px-4">{sale.qty}</td>
                  <td className="py-3 px-4">{formatCurrency(sale.unitPrice)}</td>
                  <td className="py-3 px-4 font-semibold">
                    {formatCurrency(sale.qty * sale.unitPrice)}
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
