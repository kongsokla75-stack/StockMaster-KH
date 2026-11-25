// Seeds the three inventory tables with sample rows using the publishable key.
// Safe to re-run: existing SKUs / PO numbers / invoice numbers are skipped.
// Usage: node scripts/seed-database.mjs

import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
}

const jwksUrl = env.NEXT_PUBLIC_JWKS_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceUrl = env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const base = serviceUrl && serviceKey
  ? serviceUrl
  : jwksUrl ? new URL(jwksUrl).origin : null;
const apiKey = serviceKey || key;

if (!base || !apiKey) {
  throw new Error('Missing Supabase credentials in .env.local');
}

const headers = {
  apikey: apiKey,
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
};

async function request(path, options = {}) {
  const response = await fetch(`${base}/rest/v1${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${text}`);
  return text ? JSON.parse(text) : [];
}

async function selectAll(table, columns) {
  return request(`/${table}?select=${columns}`);
}

async function insertMissing(table, rows, existingKeys, keyField) {
  const missing = rows.filter((row) => !existingKeys.has(row[keyField]));
  if (missing.length === 0) {
    console.log(`${table}: already complete (${rows.length} rows)`);
    return;
  }
  const inserted = await request(`/${table}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(missing),
  });
  console.log(`${table}: inserted ${inserted.length} row(s)`);
}

const itemsSeed = [
  {
    sku: 'ITM-001',
    name_en: 'Jasmine Rice (25kg)',
    name_kh: 'អង្ករផ្កាម្លិះ (២៥គីឡូ)',
    category: 'Food',
    selling_price: 22.5,
    reorder_level: 10,
  },
  {
    sku: 'ITM-002',
    name_en: 'Cooking Oil (5L)',
    name_kh: 'ប្រេងឆា (៥លីត្រ)',
    category: 'Grocery',
    selling_price: 8.0,
    reorder_level: 15,
  },
  {
    sku: 'ITM-003',
    name_en: 'Krama Scarf (Cotton)',
    name_kh: 'ក្រមាខ្មែរ (កប្បាស)',
    category: 'Apparel',
    selling_price: 5.5,
    reorder_level: 8,
  },
];

const purchaseSeed = [
  { po_number: 'PO-2026-01', purchase_date: '2026-11-20', supplier_name: 'Battambang Mills', sku: 'ITM-001', qty: 30, unit_cost: 18.0 },
  { po_number: 'PO-2026-02', purchase_date: '2026-11-21', supplier_name: 'Mekong Trading', sku: 'ITM-002', qty: 20, unit_cost: 6.5 },
  { po_number: 'PO-2026-03', purchase_date: '2026-11-22', supplier_name: 'Siem Reap Weavers', sku: 'ITM-003', qty: 25, unit_cost: 3.0 },
];

const saleSeed = [
  { invoice_number: 'INV-1001', sale_date: '2026-11-23', customer_name: 'Sokha Mart', sku: 'ITM-001', qty: 12, unit_price: 22.5 },
  { invoice_number: 'INV-1002', sale_date: '2026-11-24', customer_name: 'Dara Minimart', sku: 'ITM-002', qty: 14, unit_price: 8.0 },
  { invoice_number: 'INV-1003', sale_date: '2026-11-25', customer_name: 'Phnom Penh Store', sku: 'ITM-003', qty: 8, unit_price: 5.5 },
];

const existingItems = await selectAll('items', 'id,sku');
const itemIds = new Map(existingItems.map((item) => [item.sku, item.id]));
await insertMissing('items', itemsSeed, new Set(itemIds.keys()), 'sku');

const allItems = await selectAll('items', 'id,sku');
for (const item of allItems) itemIds.set(item.sku, item.id);

const purchaseRows = purchaseSeed.map(({ sku, qty, unit_cost, ...rest }) => ({
  ...rest,
  item_id: itemIds.get(sku),
  qty_added: qty,
  unit_cost,
}));
const saleRows = saleSeed.map(({ sku, qty, unit_price, ...rest }) => ({
  ...rest,
  item_id: itemIds.get(sku),
  qty_sold: qty,
  unit_price,
}));

if (purchaseRows.some((row) => row.item_id == null)) {
  throw new Error('Could not resolve item IDs for purchases');
}
if (saleRows.some((row) => row.item_id == null)) {
  throw new Error('Could not resolve item IDs for sales');
}

const existingPurchases = await selectAll('purchases', 'po_number');
const existingSales = await selectAll('sales', 'invoice_number');

await insertMissing('purchases', purchaseRows, new Set(existingPurchases.map((row) => row.po_number)), 'po_number');
await insertMissing('sales', saleRows, new Set(existingSales.map((row) => row.invoice_number)), 'invoice_number');

console.log('Done. Refresh http://localhost:3000');
