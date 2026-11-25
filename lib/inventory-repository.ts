import { getSupabase } from '@/lib/supabase/server';
import type {
  AppErrorKey,
  Item,
  NewItem,
  NewPurchase,
  NewSale,
  Purchase,
  Sale,
} from '@/lib/types';

export class InventoryError extends Error {
  constructor(readonly code: AppErrorKey) {
    super(code);
    this.name = 'InventoryError';
  }
}

interface ItemRow {
  id: number;
  sku: string;
  name_en: string;
  name_km?: string;
  name_kh?: string;
  category: string;
  cost_price?: number | string;
  sell_price?: number | string;
  selling_price?: number | string;
  reorder_level: number;
}

interface PurchaseRow {
  id: number;
  po_no?: string;
  po_number?: string;
  purchase_date: string;
  supplier?: string;
  supplier_name?: string;
  item_id: number;
  qty?: number;
  qty_added?: number;
  total_cost?: number | string;
  unit_cost: number | string;
}

interface SaleRow {
  id: number;
  inv_no?: string;
  invoice_number?: string;
  sale_date: string;
  customer?: string;
  customer_name?: string;
  item_id: number;
  qty?: number;
  qty_sold?: number;
  total_price?: number | string;
  unit_price: number | string;
}

export interface InventoryData {
  items: Item[];
  purchases: Purchase[];
  sales: Sale[];
}

function toItem(row: ItemRow): Item {
  return {
    id: Number(row.id),
    sku: row.sku,
    nameEn: row.name_en,
    nameKm: row.name_km ?? row.name_kh ?? '',
    category: row.category,
    costPrice: Number(row.cost_price ?? 0),
    sellPrice: Number(row.sell_price ?? row.selling_price ?? 0),
    reorderLevel: Number(row.reorder_level),
  };
}

function quantityFromTotal(qty: number | undefined, total: number | string | undefined, unit: number | string): number {
  if (qty !== undefined && qty !== null) return Math.round(Number(qty));
  const unitPrice = Number(unit);
  return unitPrice > 0 ? Math.round(Number(total ?? 0) / unitPrice) : 0;
}

function toPurchase(row: PurchaseRow): Purchase {
  return {
    id: Number(row.id),
    poNo: row.po_no ?? row.po_number ?? '',
    date: row.purchase_date,
    supplier: row.supplier ?? row.supplier_name ?? '',
    itemId: Number(row.item_id),
    qty: quantityFromTotal(row.qty ?? row.qty_added, row.total_cost, row.unit_cost),
    unitCost: Number(row.unit_cost),
  };
}

function toSale(row: SaleRow): Sale {
  return {
    id: Number(row.id),
    invNo: row.inv_no ?? row.invoice_number ?? '',
    date: row.sale_date,
    customer: row.customer ?? row.customer_name ?? '',
    itemId: Number(row.item_id),
    qty: quantityFromTotal(row.qty ?? row.qty_sold, row.total_price, row.unit_price),
    unitPrice: Number(row.unit_price),
  };
}

function requiredText(value: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new InventoryError('errGeneric');
  return trimmed;
}

function nonNegativeNumber(value: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new InventoryError('errGeneric');
  return parsed;
}

function positiveInteger(value: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new InventoryError('errGeneric');
  return parsed;
}

function nonNegativeInteger(value: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) throw new InventoryError('errGeneric');
  return parsed;
}

export async function getInventory(): Promise<InventoryData> {
  const supabase = getSupabase();

  const [itemsResult, purchasesResult, salesResult] = await Promise.all([
    supabase.from('items').select('*').order('id', { ascending: true }),
    supabase.from('purchases').select('*').order('id', { ascending: true }),
    supabase.from('sales').select('*').order('id', { ascending: true }),
  ]);

  for (const result of [itemsResult, purchasesResult, salesResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const rawItems = (itemsResult.data ?? []) as unknown as Array<ItemRow & { id: unknown }>;
  const rawPurchases = (purchasesResult.data ?? []) as unknown as Array<PurchaseRow & { id: unknown; item_id: unknown }>;
  const rawSales = (salesResult.data ?? []) as unknown as Array<SaleRow & { id: unknown; item_id: unknown }>;

  // Existing databases may use UUID ids. Map them to stable numeric ids so the
  // UI model stays unchanged and purchase/sale item references still resolve.
  const idMap = new Map<unknown, number>();
  rawItems.forEach((row, index) => idMap.set(row.id, index + 1));

  return {
    items: rawItems.map((row, index) => toItem({ ...row, id: index + 1 } as unknown as ItemRow)),
    purchases: rawPurchases.map((row, index) => toPurchase({
      ...row,
      id: index + 1,
      item_id: idMap.get(row.item_id) ?? 0,
    } as unknown as PurchaseRow)),
    sales: rawSales.map((row, index) => toSale({
      ...row,
      id: index + 1,
      item_id: idMap.get(row.item_id) ?? 0,
    } as unknown as SaleRow)),
  };
}

export async function createItem(input: NewItem): Promise<Item> {
  const { data, error } = await getSupabase()
    .from('items')
    .insert({
      sku: requiredText(input.sku),
      name_en: requiredText(input.nameEn),
      name_km: requiredText(input.nameKm),
      category: requiredText(input.category),
      cost_price: nonNegativeNumber(input.costPrice),
      sell_price: nonNegativeNumber(input.sellPrice),
      reorder_level: nonNegativeInteger(input.reorderLevel),
    })
    .select()
    .single();

  if (error || !data) throw new InventoryError('errGeneric');
  return toItem(data as unknown as ItemRow);
}

export async function createPurchase(input: NewPurchase): Promise<Purchase> {
  const { data, error } = await getSupabase().rpc('record_purchase', {
    p_supplier: requiredText(input.supplier),
    p_item_id: positiveInteger(input.itemId),
    p_qty: positiveInteger(input.qty),
    p_unit_cost: nonNegativeNumber(input.unitCost),
  });

  if (error || !data) throw new InventoryError('errGeneric');
  return toPurchase(data as unknown as PurchaseRow);
}

export async function createSale(input: NewSale): Promise<Sale> {
  const { data, error } = await getSupabase().rpc('record_sale', {
    p_customer: requiredText(input.customer),
    p_item_id: positiveInteger(input.itemId),
    p_qty: positiveInteger(input.qty),
    p_unit_price: nonNegativeNumber(input.unitPrice),
  });

  if (error) {
    if (error.message.includes('INSUFFICIENT_STOCK')) {
      throw new InventoryError('errInsufficientStock');
    }
    throw new InventoryError('errGeneric');
  }

  if (!data) throw new InventoryError('errGeneric');
  return toSale(data as unknown as SaleRow);
}
