-- ============================================================
-- Migration 2026-10-22: Default prices per key category
--
-- Adds optional default import/sale prices to key_categories.
-- The admin UI uses them to (a) prefill the add-key form when a
-- category is chosen and (b) drive bulk price updates for the
-- category's available keys. NULL means "no default set".
-- license_keys.import_price / unit_price stay per-key values.
-- ============================================================

ALTER TABLE public.key_categories
  ADD COLUMN IF NOT EXISTS default_import_price numeric,
  ADD COLUMN IF NOT EXISTS default_unit_price numeric;
