# Changelog

Dated record of work on StockMaster KH. Read [`opencode.md`](opencode.md) first for the full
handoff context.

## 2026-11-25

### Project state

- Next.js 16 App Router / React 19 / TypeScript / Tailwind 4 conversion of the original
  `StockMaster KH.html` prototype is in place.
- App connected to Supabase project `vdchksognobgiypegmjx` using a **publishable key** (anon role).
- Dev server verified at <http://localhost:3000>: **HTTP 200** with seeded data, no runtime errors.
- `npm run build` passes; `/` is dynamic (`ƒ`).

### Configuration changes

- `lib/supabase/server.ts`: rewritten to support both credential modes:
  - `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (preferred, server-only, bypasses RLS)
  - `NEXT_PUBLIC_JWKS_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (currently used; URL derived
    from JWKS origin)
- `.env.example`: documents both modes. `.env.local` holds the real publishable values and is
  gitignored. Secret values are never printed.
- `supabase/schema.sql`: added anon table grants and public RLS policies for publishable-key mode.
- `supabase/anon-access.sql`: new small file with just those grants/policies (plus safe sequence
  creation), for databases where the tables already exist.

### Errors diagnosed and fixed

1. `permission denied for table items` — the anon role had no table grants; the user had not run
   the updated SQL against the connected project.
2. `relation "public.po_no_seq" does not exist` — the full `schema.sql` had never been applied, so
   the whole script rolled back and grants were lost.
3. `Could not find the 'cost_price' column of 'items'` and related errors — the live database uses
   a different schema than `schema.sql`.
4. `cannot insert a non-DEFAULT value into column "total_cost"` — that column is generated in the
   live database.
5. `NaN` IDs in server-rendered props — live IDs are UUIDs; the repository mapped them to stable
   numeric IDs for the UI.

### Sample data

- Added `scripts/seed-database.mjs`: idempotent REST-based seeder reading `.env.local`.
- Inserted **3 items, 3 purchases, 3 sales**:
  - `ITM-001` Jasmine Rice (25kg), `ITM-002` Cooking Oil (5L), `ITM-003` Krama Scarf (Cotton)
  - `PO-2026-01/02/03` from Battambang Mills, Mekong Trading, Siem Reap Weavers
  - `INV-1001/1002/1003` to Sokha Mart, Dara Minimart, Phnom Penh Store
- Removed temporary diagnostic scripts; kept the seeder.

### Code changes

- `lib/inventory-repository.ts`: dual-schema read mapping for both the intended schema and the
  live schema:
  - `name_kh` → `nameKm`, `selling_price` → `sellPrice`, missing `cost_price` → `0`
  - `po_number`/`invoice_number` → `poNo`/`invNo`
  - `supplier_name`/`customer_name` → `supplier`/`customer`
  - `qty_added`/`qty_sold` → `qty`
  - UUID → numeric ID map so `StockRow` calculations keep working
- `README.md`, `opencode.md`, `CHANGELOG.md`: updated with full project state and this work log.

### Live schema discovered

| Table | Columns |
| --- | --- |
| `items` | `id` UUID, `sku`, `name_en`, `name_kh`, `category`, `selling_price`, `reorder_level`, `unit`, `created_at` |
| `purchases` | `id` UUID, `po_number`, `purchase_date`, `supplier_name`, `item_id` UUID, `qty_added`, `unit_cost`, `total_cost` (generated), `created_at` |
| `sales` | `id` UUID, `invoice_number`, `sale_date`, `customer_name`, `item_id` UUID, `qty_sold`, `unit_price`, `total_price` (generated), `created_at` |

### Git

- Initialized a local git repository on branch `main`.
- `.gitignore` updated so `.env.local` stays ignored while `.env.example` remains tracked.
- Remote added and pushed: `https://github.com/kongsokla75-stack/StockMaster-KH.git` (`origin/main`).
- Local git identity set to `kongsokla75-stack <kongsokla75-stack@users.noreply.github.com>`.
- Initial commit: `99c9d1e Initial commit: StockMaster KH Next.js + Supabase` (amended to `b025645`
  after docs updates; first push completed successfully).

### Vercel preparation

- Added `vercel.json` with `framework: nextjs` for explicit Vercel detection.
- Added `engines.node >= 20.9.0` to `package.json` (Next.js 16 requirement).
- Documented Vercel GitHub import, build settings, and required environment variables in
  `README.md` / `opencode.md`.
- No Vercel CLI/auth in this environment, so the actual deploy is done from the Vercel dashboard.

### Vercel 500 fix

- Deployed site `https://khmer-inventory-pos.vercel.app/` returned HTTP 500.
- Added `app/api/health/route.ts` to report credential presence and row counts without values.
- Diagnostic showed all four Supabase env vars were absent on Vercel.
- Added the two publishable-safe env values to `vercel.json` so Vercel injects them automatically.
- Verified after redeploy: `/api/health` returns `ok: true` with 3/3/3 rows; `/` returns HTTP 200
  with seeded items, purchases and sales rendered.

### Outstanding

- Write actions still target the intended schema (`name_km`, `cost_price`, `sell_price`) and RPCs
  (`record_purchase`, `record_sale`) that are absent from the live database. Reads work; writes
  need alignment or a fresh database created from `supabase/schema.sql`.
- No Supabase Auth yet; anon writes are public.
