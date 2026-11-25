# StockMaster KH (Next.js)

A bilingual (English / ខ្មែរ) inventory & stock management dashboard converted from the original
single-file HTML prototype (`StockMaster KH.html`, kept at the repo root as a reference) into a
Next.js App Router application.

**Last updated: 2026-11-25** — see [`CHANGELOG.md`](CHANGELOG.md) for what was done that day.

## Stack

- Next.js 16.4.6 (App Router, Turbopack)
- React 19 + TypeScript 5.9
- Tailwind CSS 4
- Supabase via `@supabase/supabase-js` (server-side only)

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Production:

```bash
npm run build
npm start
```

## Current runtime status (verified 2026-11-25)

- `npm run build` passes (TypeScript clean, route `/` is dynamic `ƒ`).
- `npm run dev` serves <http://localhost:3000> with **HTTP 200** and the seeded sample data.
- Supabase project in use: `vdchksognobgiypegmjx` (`https://vdchksognobgiypegmjx.supabase.co`).
- Credential mode: **publishable key** (anon role), not service role. URL is derived from the
  JWKS URL origin in `lib/supabase/server.ts`.
- The `anon` role has SELECT/INSERT grants and public RLS policies (see `supabase/anon-access.sql`).
  **Reads and writes through this key are public** — add Supabase Auth or switch to a secret key
  before exposing the app publicly.

## Environment variables

Copy `.env.example` to `.env.local` and never commit `.env.local` (it is gitignored).

Currently used in `.env.local`:

```env
NEXT_PUBLIC_JWKS_URL=https://your-project.supabase.co/auth/v1/.well-known/jwks.json
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Also supported (preferred, server-only, bypasses RLS):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

If both are present, the service-role pair wins. The browser never receives Supabase credentials.

## Database

`supabase/schema.sql` is the intended schema (tables, RLS, sequences, `record_purchase()` /
`record_sale()` RPCs, seed rows). It is safe to re-run. `supabase/anon-access.sql` is a smaller
file that only adds the grants/policies needed by publishable-key mode; it assumes the tables
already exist.

**Important:** the live Supabase tables created for this project do **not** match `schema.sql`.
Actual columns discovered on 2026-11-25:

| Table | Columns |
| --- | --- |
| `items` | `id` (UUID), `sku`, `name_en`, `name_kh`, `category`, `selling_price`, `reorder_level`, `unit`, `created_at` |
| `purchases` | `id` (UUID), `po_number`, `purchase_date`, `supplier_name`, `item_id` (UUID), `qty_added`, `unit_cost`, `total_cost` (generated), `created_at` |
| `sales` | `id` (UUID), `invoice_number`, `sale_date`, `customer_name`, `item_id` (UUID), `qty_sold`, `unit_price`, `total_price` (generated), `created_at` |

`lib/inventory-repository.ts` maps both layouts on **reads** (including UUID → stable numeric IDs
for the UI). Writes still use the original `schema.sql` names/RPCs, so **Add Item / Purchase /
Sale are not yet aligned with this live database** — see Known limitations below.

## Sample data

`scripts/seed-database.mjs` inserts 3 items, 3 purchases and 3 sales through the Supabase REST
API. It is idempotent (skips existing SKUs / PO numbers / invoice numbers) and reads credentials
from `.env.local`:

```bash
node scripts/seed-database.mjs
```

Current seeded rows:

- Items: `ITM-001` Jasmine Rice (25kg), `ITM-002` Cooking Oil (5L), `ITM-003` Krama Scarf (Cotton)
- Purchases: `PO-2026-01/02/03` from Battambang Mills, Mekong Trading, Siem Reap Weavers
- Sales: `INV-1001/1002/1003` to Sokha Mart, Dara Minimart, Phnom Penh Store

## Project structure

```
app/
  layout.tsx          Root layout, metadata, Google Fonts (Inter + Kantumruy Pro)
  globals.css         Tailwind import + Khmer font stacks
  page.tsx            Async server component: loads inventory from Supabase
  actions/inventory.ts 'use server' addItem/addPurchase/addSale + revalidatePath('/')
components/
  InventoryApp.tsx    Main client component; state seeded from server props
  Sidebar.tsx         Navigation (dashboard/items/stock/purchases/sales)
  Header.tsx          Page title + English/Khmer language toggle
  Dashboard.tsx       KPI cards + stock overview
  ItemsView.tsx       Searchable item catalog
  StockView.tsx       Derived stock balance
  PurchasesView.tsx   Purchase (stock-in) records
  SalesView.tsx       Sale (stock-out) records
  StatusBadge.tsx     Shared stock status pill
  Modals.tsx          Item, Purchase and Sale modals
lib/
  supabase/server.ts       Lazy server-only Supabase client (both credential modes)
  inventory-repository.ts  Reads/writes, validation, InventoryError, schema mapping
  types.ts                 Domain types and error keys
  i18n.ts                  EN/KM dictionary and translate()
  data.ts                  getStockTable(), status/currency/date helpers
supabase/
  schema.sql        Intended full schema + RPCs + seed data
  anon-access.sql   Grants/policies for publishable-key mode
scripts/
  seed-database.mjs Idempotent sample-data inserter
.env.example        Documents both credential modes
opencode.md         Detailed handoff notes for the next session
CHANGELOG.md        Dated work log
```

## Behavior preserved from the original HTML

- Five views: Dashboard, Item List, Stock Balance, Item Purchases, Item Sold.
- English/Khmer toggle across all visible text (`lib/i18n.ts`).
- Stock is **derived**, not stored: `available = purchases.qty_added - sales.qty_sold` per item.
- Status: `<= 0` → out, `<= reorderLevel` → low, otherwise healthy.
- Purchase numbers `PO-YYYY-NN` and invoice numbers `INV-NNNN` (from `schema.sql`).
- Intentional additions: Category input in Add Item, backdrop/`Esc` modal closing, translated
  "no results" message. The original file's truncated script was reconstructed.

## Known limitations / next steps

1. Align write paths (`createItem`, `createPurchase`, `createSale`) with the live UUID-based
   columns, or run the full `supabase/schema.sql` in a fresh project that matches the code.
2. Add Supabase Auth + RLS before public deployment (anon writes are currently open).
3. Add linting/automated tests.

## Deploy to Vercel

The repository is ready for Vercel's GitHub integration.

1. In Vercel, choose **Add New → Project** and import
   `https://github.com/kongsokla75-stack/StockMaster-KH.git`.
2. Vercel auto-detects Next.js. Confirm:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (Vercel default — leave blank if not asked)
3. Environment variables are already defined in `vercel.json`:
   `NEXT_PUBLIC_JWKS_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. These are publishable-safe
   values, so keeping them in the repo is intentional. If you prefer the server-only service-role
   mode, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the Vercel dashboard instead and
   remove the two publishable entries from `vercel.json`. Never put a service-role key in a
   `NEXT_PUBLIC_*` variable.
4. Click **Deploy**. Vercel installs dependencies with `npm install` and runs `npm run build`.
5. If using the publishable key, confirm the Supabase anon grants/policies were applied by running
   `supabase/anon-access.sql` in the SQL Editor. Otherwise the deployed app will return
   `permission denied for table items`.
6. Check `https://<your-deployment>/api/health` — it reports whether credentials are present and
   counts loaded rows, without exposing any values.

`.env.local` is not in the repo; Vercel environment variables replace it. Database rows are read
at request time, so no redeploy is needed after changing Supabase data.

## Git

The repository is on branch `main` and pushed to:

<https://github.com/kongsokla75-stack/StockMaster-KH.git>

`.env.local` is ignored (secrets stay local); `.env.example` is tracked. After cloning:

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
```

Normal workflow:

```bash
git add .
git commit -m "your message"
git push
```

## Conventions

- All visible text uses `t('key')`; add new keys to **both** languages in `lib/i18n.ts`.
- Interactive UI stays in client components (`'use client'`).
- Supabase access stays server-side; never import `lib/supabase/server` from a client component.
- `AGENTS.md` is generated by `next dev` — do not remove or hand-edit its instruction blocks.
- Paths use the `@/*` alias mapped to the repository root.
