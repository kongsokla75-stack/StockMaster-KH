-- Quick read/write grant fix for publishable-key (anon role) mode. Safe to re-run.
-- This assumes the tables already exist. For a complete setup (tables, sequences,
-- RPC functions, seed data), run the full supabase/schema.sql instead.

create sequence if not exists public.po_no_seq as integer start with 1;
create sequence if not exists public.invoice_no_seq as integer start with 1001;

grant usage on schema public to anon;
grant select, insert on public.items to anon;
grant select, insert on public.purchases to anon;
grant select, insert on public.sales to anon;
grant usage on sequence public.po_no_seq to anon;
grant usage on sequence public.invoice_no_seq to anon;
-- Functions are executable by PUBLIC by default; no explicit grant needed.

drop policy if exists "anon_select_items" on public.items;
drop policy if exists "anon_insert_items" on public.items;
drop policy if exists "anon_select_purchases" on public.purchases;
drop policy if exists "anon_insert_purchases" on public.purchases;
drop policy if exists "anon_select_sales" on public.sales;
drop policy if exists "anon_insert_sales" on public.sales;

create policy "anon_select_items" on public.items for select to anon using (true);
create policy "anon_insert_items" on public.items for insert to anon with check (true);
create policy "anon_select_purchases" on public.purchases for select to anon using (true);
create policy "anon_insert_purchases" on public.purchases for insert to anon with check (true);
create policy "anon_select_sales" on public.sales for select to anon using (true);
create policy "anon_insert_sales" on public.sales for insert to anon with check (true);
