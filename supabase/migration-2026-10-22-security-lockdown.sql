-- ============================================================
-- Migration 2026-10-22: Security lockdown — phase 1 (RLS)
--
-- Problem: the policies created by rls-policies.sql and
-- migration-2026-10-04.sql grant the PUBLIC anon key full CRUD
-- on every table (USING(true)). The anon key ships in the site's
-- public JS bundle, so anyone could read/overwrite all data —
-- including the users table (password hashes) and
-- system_settings (Zalo bot token/secret, bank account).
--
-- Phase 1 scope: tables the BROWSER never touches directly.
-- Verified in the codebase: lib/store.tsx (the browser data
-- layer) only queries inventory_items, service_tickets,
-- customers, spare_parts, shift_logs, onsite_dispatches,
-- blog_posts, blog_categories, orders. The tables locked here
-- are only accessed by server code through
-- lib/server/supabaseAdmin.ts, which uses SUPABASE_SECRET_KEY
-- (service_role) and bypasses RLS entirely.
--
-- After this migration, anon/authenticated have NO access at
-- all to: users, system_settings, license_keys,
-- key_categories, key_release_requests.
--
-- Phase 2 (not in this file): the operational tables used by
-- the browser store need a server-issued staff JWT or API
-- mediation before their policies can be tightened.
-- ============================================================

-- 1) Drop EVERY existing policy on the phase-1 tables
--    (names vary between rls-policies.sql / migration-2026-10-04.sql
--    and whatever was created in the dashboard).
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'system_settings', 'license_keys', 'key_categories', 'key_release_requests')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 2) Make sure RLS is enabled (with no policies left, anon and
--    authenticated are denied by default; service_role bypasses).
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'license_keys') THEN
    EXECUTE 'ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'key_categories') THEN
    EXECUTE 'ALTER TABLE public.key_categories ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'key_release_requests') THEN
    EXECUTE 'ALTER TABLE public.key_release_requests ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- 3) Defense in depth: revoke table privileges from anon and
--    authenticated as well (service_role keeps its own grants).
REVOKE ALL ON public.users FROM anon, authenticated;
REVOKE ALL ON public.system_settings FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'license_keys') THEN
    EXECUTE 'REVOKE ALL ON public.license_keys FROM anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'key_categories') THEN
    EXECUTE 'REVOKE ALL ON public.key_categories FROM anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'key_release_requests') THEN
    EXECUTE 'REVOKE ALL ON public.key_release_requests FROM anon, authenticated';
  END IF;
END $$;

-- ============================================================
-- VERIFY (run separately after applying):
--   Using the anon key against PostgREST, all of these must
--   now fail (401/403) or return no access:
--     GET /rest/v1/users?select=id
--     GET /rest/v1/system_settings?select=id
--     GET /rest/v1/license_keys?select=id
--   The app must still work: login, /api/keys with a staff
--   session, warranty search, site settings display.
--
-- ROLLBACK (emergency only — re-opens the holes):
--   GRANT SELECT, INSERT, UPDATE, DELETE ON public.users, public.system_settings TO anon, authenticated;
--   CREATE POLICY "anon_all_users" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);
--   CREATE POLICY "anon_all_settings" ON public.system_settings FOR ALL TO anon USING (true) WITH CHECK (true);
--   (license tables: re-run the grants/policies from the
--   original license-key setup if it existed outside this repo)
-- ============================================================
