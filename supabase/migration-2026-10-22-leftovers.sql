-- ============================================================
-- Migration 2026-10-22: leftover hardening
-- 1) password_reset_tokens — DB-backed password recovery tokens
--    (replaces the .data/password-recovery.json + in-memory store,
--    which loses tokens across serverless instances).
--    Service-role only: RLS on, no policies, grants revoked.
-- 2) warranty_provisions + admin_deductions — persist the finance
--    records that previously lived only in browser localStorage.
--    Staff-only via the authenticated role (server-issued JWT);
--    anonymous access: none.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
  ON public.password_reset_tokens (user_id);
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.password_reset_tokens FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.warranty_provisions (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_type TEXT,
  item_title TEXT,
  serial_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_code TEXT,
  seller_name TEXT,
  sale_date TIMESTAMPTZ,
  warranty_months INTEGER,
  warranty_expiry_date TIMESTAMPTZ,
  sale_price NUMERIC,
  cost_price NUMERIC,
  net_profit NUMERIC,
  provision_rate NUMERIC,
  provision_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending_approval',
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  unlocked_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  settlement_year INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.warranty_provisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_all_warranty_provisions ON public.warranty_provisions;
CREATE POLICY staff_all_warranty_provisions ON public.warranty_provisions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.warranty_provisions TO authenticated;
REVOKE ALL ON public.warranty_provisions FROM anon;

CREATE TABLE IF NOT EXISTS public.admin_deductions (
  id TEXT PRIMARY KEY,
  product_name TEXT,
  product_type TEXT,
  sale_date TIMESTAMPTZ,
  sale_price NUMERIC,
  cost_price NUMERIC,
  net_profit NUMERIC,
  admin_rate NUMERIC,
  admin_deduction NUMERIC,
  capital_refund NUMERIC,
  customer_name TEXT,
  customer_phone TEXT,
  seller_name TEXT,
  order_code TEXT,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.admin_deductions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_all_admin_deductions ON public.admin_deductions;
CREATE POLICY staff_all_admin_deductions ON public.admin_deductions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_deductions TO authenticated;
REVOKE ALL ON public.admin_deductions FROM anon;
