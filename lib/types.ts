export type Lang = 'en' | 'km';

export type Tab = 'dashboard' | 'items' | 'stock' | 'purchases' | 'sales';

export type ModalName = 'item' | 'purchase' | 'sale';

export type StockStatus = 'out' | 'low' | 'healthy';

export type AppErrorKey = 'errInsufficientStock' | 'errGeneric';

export interface Item {
  id: number;
  sku: string;
  nameEn: string;
  nameKm: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  reorderLevel: number;
}

export interface Purchase {
  id: number;
  poNo: string;
  date: string;
  supplier: string;
  itemId: number;
  qty: number;
  unitCost: number;
}

export interface Sale {
  id: number;
  invNo: string;
  date: string;
  customer: string;
  itemId: number;
  qty: number;
  unitPrice: number;
}

export interface StockRow extends Item {
  totalPurchased: number;
  totalSold: number;
  available: number;
}

export type NewItem = Omit<Item, 'id'>;
export type NewPurchase = Omit<Purchase, 'id' | 'poNo' | 'date'>;
export type NewSale = Omit<Sale, 'id' | 'invNo' | 'date'>;
