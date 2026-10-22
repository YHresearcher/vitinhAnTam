-- ============================================================
-- Migration 2026-10-22 B3: hide cost/PII columns from the public
-- (anon) role on the two public catalog tables.
--
-- Why: RLS is row-level; the anon role could read cost_price /
-- import_price / unit_cost / buyer phone numbers straight from
-- PostgREST even after the B2 lockdown, because the storefront
-- legitimately needs the tables themselves.
--
-- NOTE: a column-level REVOKE alone is a NO-OP while a table-level
-- SELECT grant exists (verified live: unit_cost stayed readable).
-- The working pattern is: revoke the table-level grant, then grant
-- SELECT on the safe columns only. Staff (authenticated) keep the
-- table-level grant and are unaffected.
-- Rollback: GRANT SELECT ON <table> TO anon;
-- ============================================================

-- ---------- spare_parts: hide unit_cost ----------
REVOKE SELECT ON public.spare_parts FROM anon;
GRANT SELECT (
  id, part_name, part_type, condition, quantity_in_stock,
  warranty_months, distributor, unit_price, shelf_location,
  notes, created_at
) ON public.spare_parts TO anon;

-- ---------- inventory_items: hide cost + buyer PII + reservation internals ----------
REVOKE SELECT ON public.inventory_items FROM anon;
GRANT SELECT (
  id, brand, burn_in_duration, cpu, created_at, customer_name,
  device_model, form_factor, image_urls, import_date, model,
  price, qc_status, quantity, ram, retail_price, serial_number,
  service_tag, shelf_location, specs, specs_summary,
  ssd_capacity, ssd_health, stock_quantity, warranty_months
) ON public.inventory_items TO anon;
