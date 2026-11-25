'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { addItemAction, addPurchaseAction, addSaleAction } from '@/app/actions/inventory';
import { getStockTable } from '@/lib/data';
import { translate, type TranslationKey } from '@/lib/i18n';
import type {
  AppErrorKey,
  Item,
  Lang,
  ModalName,
  NewItem,
  NewPurchase,
  NewSale,
  Purchase,
  Sale,
  Tab,
} from '@/lib/types';
import Dashboard from './Dashboard';
import Header from './Header';
import ItemsView from './ItemsView';
import { ItemModal, PurchaseModal, SaleModal } from './Modals';
import PurchasesView from './PurchasesView';
import SalesView from './SalesView';
import Sidebar from './Sidebar';
import StockView from './StockView';

interface InventoryAppProps {
  initialItems: Item[];
  initialPurchases: Purchase[];
  initialSales: Sale[];
}

export default function InventoryApp({
  initialItems,
  initialPurchases,
  initialSales,
}: InventoryAppProps) {
  const [lang, setLang] = useState<Lang>('en');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [items, setItems] = useState<Item[]>(initialItems);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalName | null>(null);
  const [errorKey, setErrorKey] = useState<AppErrorKey | null>(null);

  const t = useCallback((key: TranslationKey) => translate(lang, key), [lang]);
  const stockRows = useMemo(
    () => getStockTable(items, purchases, sales),
    [items, purchases, sales],
  );

  const openModal = useCallback((name: ModalName) => {
    setErrorKey(null);
    setModal(name);
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!modal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, closeModal]);

  const handleAddItem = async (data: NewItem) => {
    const result = await addItemAction(data);
    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }
    setItems((prev) => [...prev, result.data]);
    closeModal();
  };

  const handleAddPurchase = async (data: NewPurchase) => {
    const result = await addPurchaseAction(data);
    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }
    setPurchases((prev) => [...prev, result.data]);
    closeModal();
  };

  const handleAddSale = async (data: NewSale) => {
    const stock = stockRows.find((row) => row.id === data.itemId);
    if (!stock || data.qty > stock.available) {
      setErrorKey('errInsufficientStock');
      return;
    }

    const result = await addSaleAction(data);
    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }
    setSales((prev) => [...prev, result.data]);
    closeModal();
  };

  const modalError = errorKey ? t(errorKey) : '';

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar lang={lang} activeTab={activeTab} onTabChange={setActiveTab} t={t} />

      <div className="flex-1 flex flex-col">
        <Header lang={lang} activeTab={activeTab} onLanguageChange={setLang} t={t} />

        <main className="p-6 flex-1 space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              stockRows={stockRows}
              sales={sales}
              lang={lang}
              t={t}
              onOpenModal={openModal}
            />
          )}
          {activeTab === 'items' && (
            <ItemsView
              items={items}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              t={t}
              onOpenModal={openModal}
            />
          )}
          {activeTab === 'stock' && <StockView stockRows={stockRows} lang={lang} t={t} />}
          {activeTab === 'purchases' && (
            <PurchasesView
              purchases={purchases}
              items={items}
              lang={lang}
              t={t}
              onOpenModal={openModal}
            />
          )}
          {activeTab === 'sales' && (
            <SalesView
              sales={sales}
              items={items}
              lang={lang}
              t={t}
              onOpenModal={openModal}
            />
          )}
        </main>
      </div>

      {modal === 'item' && (
        <ItemModal t={t} error={modalError} onClose={closeModal} onSubmit={handleAddItem} />
      )}
      {modal === 'purchase' && (
        <PurchaseModal
          items={items}
          lang={lang}
          t={t}
          error={modalError}
          onClose={closeModal}
          onSubmit={handleAddPurchase}
        />
      )}
      {modal === 'sale' && (
        <SaleModal
          items={items}
          lang={lang}
          t={t}
          error={modalError}
          onClose={closeModal}
          onSubmit={handleAddSale}
        />
      )}
    </div>
  );
}
