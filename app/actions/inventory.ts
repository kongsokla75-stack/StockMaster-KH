'use server';

import { revalidatePath } from 'next/cache';
import {
  createItem,
  createPurchase,
  createSale,
  InventoryError,
} from '@/lib/inventory-repository';
import type {
  AppErrorKey,
  Item,
  NewItem,
  NewPurchase,
  NewSale,
  Purchase,
  Sale,
} from '@/lib/types';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: AppErrorKey };

function toErrorKey(error: unknown): AppErrorKey {
  return error instanceof InventoryError ? error.code : 'errGeneric';
}

export async function addItemAction(input: NewItem): Promise<ActionResult<Item>> {
  try {
    const item = await createItem(input);
    revalidatePath('/');
    return { ok: true, data: item };
  } catch (error) {
    return { ok: false, error: toErrorKey(error) };
  }
}

export async function addPurchaseAction(input: NewPurchase): Promise<ActionResult<Purchase>> {
  try {
    const purchase = await createPurchase(input);
    revalidatePath('/');
    return { ok: true, data: purchase };
  } catch (error) {
    return { ok: false, error: toErrorKey(error) };
  }
}

export async function addSaleAction(input: NewSale): Promise<ActionResult<Sale>> {
  try {
    const sale = await createSale(input);
    revalidatePath('/');
    return { ok: true, data: sale };
  } catch (error) {
    return { ok: false, error: toErrorKey(error) };
  }
}
