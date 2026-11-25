'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { getItemDisplayName } from '@/lib/data';
import type { Translate } from '@/lib/i18n';
import type { Item, Lang, NewItem, NewPurchase, NewSale } from '@/lib/types';

const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm';
const labelClass = 'block text-xs font-semibold text-slate-600 mb-1';

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function ItemModal({
  t,
  error,
  onClose,
  onSubmit,
}: {
  t: Translate;
  error: string;
  onClose: () => void;
  onSubmit: (item: NewItem) => void;
}) {
  const [sku, setSku] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameKm, setNameKm] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [reorderLevel, setReorderLevel] = useState('5');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      sku,
      nameEn,
      nameKm,
      category: category.trim() || 'General',
      costPrice: Number(costPrice),
      sellPrice: Number(sellPrice),
      reorderLevel: Number(reorderLevel),
    });
  };

  return (
    <ModalShell title={t('modalAddItemTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="newSku">{t('colSku')}</label>
          <input
            id="newSku"
            type="text"
            required
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            placeholder="ITM-004"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="newNameEn">{t('colNameEn')}</label>
          <input
            id="newNameEn"
            type="text"
            required
            value={nameEn}
            onChange={(event) => setNameEn(event.target.value)}
            placeholder="Wireless Mouse"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="newNameKm">{t('colNameKm')}</label>
          <input
            id="newNameKm"
            type="text"
            required
            value={nameKm}
            onChange={(event) => setNameKm(event.target.value)}
            placeholder="ម៉ៅឥតខ្សែ"
            className={`${inputClass} khmer-font`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="newCategory">{t('colCategory')}</label>
          <input
            id="newCategory"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Grocery"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="newCost">{t('colCostPrice')} ($)</label>
            <input
              id="newCost"
              type="number"
              step="0.01"
              required
              value={costPrice}
              onChange={(event) => setCostPrice(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="newSell">{t('colSellPrice')} ($)</label>
            <input
              id="newSell"
              type="number"
              step="0.01"
              required
              value={sellPrice}
              onChange={(event) => setSellPrice(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="newReorder">{t('colReorderLevel')}</label>
          <input
            id="newReorder"
            type="number"
            required
            min="0"
            value={reorderLevel}
            onChange={(event) => setReorderLevel(event.target.value)}
            className={inputClass}
          />
        </div>
        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {t('btnCancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-slate-900 text-white font-semibold rounded-lg"
          >
            {t('btnSave')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function PurchaseModal({
  items,
  lang,
  t,
  error,
  onClose,
  onSubmit,
}: {
  items: Item[];
  lang: Lang;
  t: Translate;
  error: string;
  onClose: () => void;
  onSubmit: (purchase: NewPurchase) => void;
}) {
  const [itemId, setItemId] = useState(String(items[0]?.id ?? ''));
  const [supplier, setSupplier] = useState('');
  const [qty, setQty] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      itemId: Number(itemId),
      supplier,
      qty: Number(qty),
      unitCost: Number(unitCost),
    });
  };

  return (
    <ModalShell title={t('modalPurchaseTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="purchaseItemSelect">{t('colItemName')}</label>
          <select
            id="purchaseItemSelect"
            required
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
            className={inputClass}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sku} — {getItemDisplayName(item, lang)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="purchaseSupplier">{t('colSupplier')}</label>
          <input
            id="purchaseSupplier"
            type="text"
            required
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
            placeholder="Phnom Penh Tech Supply"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="purchaseQty">{t('colQty')}</label>
            <input
              id="purchaseQty"
              type="number"
              min="1"
              required
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="purchaseCost">{t('colUnitCost')} ($)</label>
            <input
              id="purchaseCost"
              type="number"
              step="0.01"
              required
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {t('btnCancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-lg"
          >
            {t('btnSave')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function SaleModal({
  items,
  lang,
  t,
  error,
  onClose,
  onSubmit,
}: {
  items: Item[];
  lang: Lang;
  t: Translate;
  error: string;
  onClose: () => void;
  onSubmit: (sale: NewSale) => void;
}) {
  const [itemId, setItemId] = useState(String(items[0]?.id ?? ''));
  const [customer, setCustomer] = useState('');
  const [qty, setQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      itemId: Number(itemId),
      customer,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
    });
  };

  return (
    <ModalShell title={t('modalSaleTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="saleItemSelect">{t('colItemName')}</label>
          <select
            id="saleItemSelect"
            required
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
            className={inputClass}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sku} — {getItemDisplayName(item, lang)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="saleCustomer">{t('colCustomer')}</label>
          <input
            id="saleCustomer"
            type="text"
            required
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
            placeholder="Walk-in Customer"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="saleQty">{t('colQty')}</label>
            <input
              id="saleQty"
              type="number"
              min="1"
              required
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="salePrice">{t('colSellPrice')} ($)</label>
            <input
              id="salePrice"
              type="number"
              step="0.01"
              required
              value={unitPrice}
              onChange={(event) => setUnitPrice(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {t('btnCancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg"
          >
            {t('btnSave')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
