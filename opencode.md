# Project Context — StockMaster KH

**Read this file first when you open the project.** It describes the current state and everything
that was done on 2026-11-25. See [`README.md`](README.md) for user-facing docs and
[`CHANGELOG.md`](CHANGELOG.md) for the dated work log.

## Current state (as of 2026-11-25)

Converted from the single vanilla HTML file `StockMaster KH.html` (kept at the root as a reference)
into a **Next.js 16 App Router** application.

- Stack: Next.js 16.4.6 (Turbopack), React 19.3.1, TypeScript 5.9, Tailwind CSS 4.3.
- The original HTML's inline script was truncated mid-function; render logic and submit handlers
  were reconstructed while preserving the original data model and behavior.
- Five views preserved: Dashboard, Item List, Stock Balance, Item Purchases, Item Sold. Bilingual
  EN/KM through `t('key')` in `lib/i18n.ts`.
- Supabase is connected and seeded. `app/page.tsx` loads rows on the server every request;
  `app/actions/inventory.ts` handles writes through `lib/inventory-repository.ts`.
- Verified on 2026-11-25: `npm run build` passes; `/` is dynamic (`ƒ`); dev server returns
  **HTTP 200** at <http://localhost:3000> with all seeded rows and no `NaN`/permission errors.

## Supabase setup actually in use

- Project ref: `vdchksognobgiypegmjx` — <https://vdchksognobgiypegmjx.supabase.co>
- `.env.local` contains:
  - `NEXT_PUBLIC_JWKS_URL` (project JWKS URL)
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`)
- `lib/supabase/server.ts` derives the Supabase URL from the JWKS origin and uses the publishable
  key as an anon-role client. It also supports the preferred service-role pair
  (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`); that pair wins if present.
- Anon grants/policies were applied via `supabase/anon-access.sql`. Reads and writes are public.
- No Supabase Auth yet. Do not expose publicly without Auth or the service-role mode.

## Live database schema (different from `supabase/schema.sql`!)

Discovered by probing the REST schema cache on 2026-11-25:

| Table | Columns |
| --- | --- |
| `items` | `id` UUID, `sku`, `name_en`, `name_kh`, `category`, `selling_price`, `reorder_level`, `unit`, `created_at` |
| `purchases` | `id` UUID, `po_number`, `purchase_date`, `supplier_name`, `item_id` UUID, `qty_added`, `unit_cost`, `total_cost` (generated), `created_at` |
| `sales` | `id` UUID, `invoice_number`, `sale_date`, `customer_name`, `item_id` UUID, `qty_sold`, `unit_price`, `total_price` (generated), `created_at` |

`supabase/schema.sql` describes the *intended* schema (`name_km`, `cost_price`, `sell_price`,
`po_no`, `supplier`, `qty`, `inv_no`, `customer`, integer IDs, RPC functions). It was never fully
applied to this project: `create table if not exists` left the pre-existing tables untouched, and
the missing sequences made the whole script roll back.

**Read mapping** in `lib/inventory-repository.ts` now accepts both layouts:

- `name_kh` → `nameKm`; `selling_price` → `sellPrice`; missing `cost_price` → `0`.
- `po_number`/`invoice_number` → `poNo`/`invNo`.
- `supplier_name`/`customer_name` → `supplier`/`customer`.
- `qty_added`/`qty_sold` → `qty` (falls back to `total / unit` if needed).
- UUID IDs are mapped to stable numeric IDs (array index + 1) so the existing camelCase UI model
  and `StockRow` calculations keep working.

**Writes are NOT aligned yet.** `createItem()` inserts `name_km`, `cost_price`, `sell_price`;
`createPurchase()`/`createSale()` call `record_purchase()`/`record_sale()` RPCs that do not exist in
this database. Fix these before relying on the Add Item / Purchase / Sale forms.

## What was done on 2026-11-25

1. Started dev server; found placeholders in `.env.local`, then found the user's real values were
   `NEXT_PUBLIC_JWKS_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. Asked the user which credential mode to use; they chose **publishable key**.
3. Rewrote `lib/supabase/server.ts` to derive the URL from the JWKS origin and support both modes;
   updated `.env.example`, `README.md` and this file accordingly.
4. Added anon grants/policies to `supabase/schema.sql` and created `supabase/anon-access.sql`.
5. Hit `permission denied for table items` → diagnosed missing table grants; then
   `relation "public.po_no_seq" does not exist` → diagnosed that the full schema had never run.
6. Created `scripts/seed-database.mjs` to insert sample rows via the Supabase REST API.
7. Discovered the live schema mismatch through failed inserts and a column probe:
   - `cost_price` → actual `selling_price` / `name_kh`
   - `po_no`, `supplier`, `qty` → actual `po_number`, `supplier_name`, `qty_added`, generated `total_cost`
   - `inv_no`, `customer`, `qty` → actual `invoice_number`, `customer_name`, `qty_sold`, generated `total_price`
   - IDs are UUIDs → mapped to numeric IDs in the repository.
8. Inserted 3 rows in each table, verified HTTP 200 with `ITM-001`, `PO-2026-01`, `INV-1001`
   rendered and no `NaN`. Final `npm run build` passed.
9. Removed temporary diagnostic scripts; kept `scripts/seed-database.mjs`.

## Run / verify

```bash
npm install          # dependencies already installed
npm run dev          # http://localhost:3000
npm run build        # production build + TypeScript check
npm start            # serve the production build
node scripts/seed-database.mjs   # idempotent sample data (safe to re-run)
```

Quick health check:

```powershell
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
```

Expect `HTTP 200` and content containing `Jasmine Rice`, `PO-2026-01`, `INV-1001`.

## File map

```
app/
  layout.tsx          Root layout, metadata, Google Fonts
  globals.css         Tailwind import + Khmer font stacks
  page.tsx            Async server component: loads inventory from Supabase
  actions/inventory.ts 'use server' addItem/addPurchase/addSale + revalidatePath('/')
components/
  InventoryApp.tsx    Client state seeded from server props; calls Server Actions
  Sidebar.tsx         Five-tab navigation
  Header.tsx          Language toggle
  Dashboard.tsx       KPI cards + stock overview
  ItemsView.tsx       Searchable item catalog
  StockView.tsx       Derived stock balance
  PurchasesView.tsx   Purchase records
  SalesView.tsx       Sale records
  StatusBadge.tsx     Shared status pill
  Modals.tsx          Item/Purchase/Sale modals
lib/
  supabase/server.ts       Lazy server-only client; both credential modes
  inventory-repository.ts  Reads/writes, validation, dual-schema mapping
  types.ts                 Lang, Tab, ModalName, StockStatus, AppErrorKey, domain types
  i18n.ts                  EN/KM dictionary, translate(), statusLabelKeys
  data.ts                  getStockTable(), display/status/currency/date helpers
supabase/
  schema.sql        Intended full schema, RPCs, seed data
  anon-access.sql   Grants/policies for publishable-key mode
scripts/
  seed-database.mjs Idempotent REST seeder
.env.example        Both credential modes documented
README.md           User-facing docs
CHANGELOG.md        Dated work log
```

## Domain model

- UI types: `Item` (id, sku, nameEn, nameKm, category, costPrice, sellPrice, reorderLevel),
  `Purchase` (id, poNo, date, supplier, itemId, qty, unitCost),
  `Sale` (id, invNo, date, customer, itemId, qty, unitPrice).
- `StockRow` is derived, not stored: `available = sum(purchase.qty) - sum(sale.qty)` per item.
- Status: `<= 0` → out, `<= reorderLevel` → low, otherwise healthy.
- Number formats preserved: `PO-YYYY-NN`, `INV-NNNN`.

## Conventions to follow

- `AGENTS.md` at root (and `node_modules/next/AGENTS.md`) is generated by `next dev`. It requires
  reading the matching guide under `node_modules/next/dist/docs/` before writing Next.js code.
  Do not remove those blocks. Docs used so far: `01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `11-css.md`, `13-fonts.md`.
- All visible text through `t('key')`; add new keys to **both** languages in `lib/i18n.ts`.
- Interactive UI in client components (`'use client'`).
- Keep all Supabase access server-side. Never import `@/lib/supabase/server` from a client
  component; never prefix a service-role key with `NEXT_PUBLIC_`.
- Server Actions are directly reachable via POST, so validation lives in the repository/actions.
- Preserve the Tailwind class-based styling and five-tab layout.
- Paths use the `@/*` alias mapped to the repository root.
- Do not print secret values from `.env.local` in chat or logs.

## Intentional deviations from the original HTML

- Added a Category input to the Add Item modal (blank values fall back to `General`).
- Added backdrop-click and `Esc` closing for modals.
- Added a translated "no results" message and search placeholder.
- Rebuilt the truncated script logic, including KPI calculations and all submit handlers.

## Vercel deployment

- Repo is ready for Vercel GitHub import; `vercel.json` explicitly sets `framework: nextjs`.
- `package.json` declares `engines.node >= 20.9.0` (required by Next.js 16).
- Deployed at `https://khmer-inventory-pos.vercel.app/`.
- Supabase env vars are defined in `vercel.json` (publishable-safe values, no `.env.local` in git):
  `NEXT_PUBLIC_JWKS_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Service-role mode would instead
  use dashboard-only `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
- Publishable-key mode requires the anon grants/policies from `supabase/anon-access.sql` to be
  applied in Supabase, or the deployed page returns `permission denied for table items`.
- `app/api/health/route.ts` is a public diagnostic: reports credential presence (booleans) and row
  counts. It was used to confirm the 500 was caused by missing Vercel env vars.
- No Vercel CLI/auth in this environment; deploys happen via GitHub push.

## Git

- Repo initialized on `main` and pushed to
  `https://github.com/kongsokla75-stack/StockMaster-KH.git`.
- `.gitignore` ignores `.env.local` but keeps `.env.example`.
- Local git identity: `kongsokla75-stack <kongsokla75-stack@users.noreply.github.com>`.
- `origin/main` tracks the GitHub repository; `git push` is enough for later updates.

## Possible next steps (not done)

- Align write actions with the live UUID/schema layout (highest priority).
- Add Supabase Auth + RLS before public deployment; anon writes are currently open.
- Add lint configuration / automated tests.
- Split the large `Modals.tsx` if forms grow.
