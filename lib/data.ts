import type { Item, Lang, Purchase, Sale, StockRow, StockStatus } from './types';

// Initial records are seeded into Supabase by supabase/schema.sql; the app
// loads them through lib/inventory-repository.ts instead of keeping them here.

/** Derived stock table: purchases minus sales, calculated per item. */
export function getStockTable(items: Item[], purchases: Purchase[], sales: Sale[]): StockRow[] {
  return items.map((item) => {
    const totalPurchased = purchases
      .filter((p) => p.itemId === item.id)
      .reduce((sum, p) => sum + p.qty, 0);
    const totalSold = sales
      .filter((s) => s.itemId === item.id)
      .reduce((sum, s) => sum + s.qty, 0);

    return { ...item, totalPurchased, totalSold, available: totalPurchased - totalSold };
  });
}

export function getItemDisplayName(item: Pick<Item, 'nameEn' | 'nameKm'>, lang: Lang): string {
  return lang === 'km' ? item.nameKm : item.nameEn;
}

export function getStockStatus(available: number, reorderLevel: number): StockStatus {
  if (available <= 0) return 'out';
  if (available <= reorderLevel) return 'low';
  return 'healthy';
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
