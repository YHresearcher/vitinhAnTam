-- ============================================================
-- Migration 2026-10-22: RLS lockdown — phase B2 (operational tables)
--
-- Context: the 7 operational tables have per-command policies
-- named anon_* granted to roles {anon, authenticated}; the blog
-- tables have {public} policies. The anon key is public (it ships
-- in the site's JS bundle), so until now anyone could read/write
-- everything directly through PostgREST.
--
-- The app now gives signed-in staff a server-issued Supabase JWT
-- (role "authenticated", see /api/auth/supabase-token), and all
-- server-side writes use the service-role key. This migration
-- therefore narrows every write policy to "authenticated" only,
-- and removes anonymous reads from the PII tables. Anonymous
-- (public) access that remains, by design:
--   - inventory_items / spare_parts: SELECT (public shop catalog)
--   - blog_categories: SELECT (public blog navigation)
--   - blog_posts: SELECT only rows with status='published'
-- Everything else anonymous: denied.
--
-- Rollback (emergency): re-run the ALTERs with
-- "TO anon, authenticated" (blog: "TO public") and re-grant:
--   GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON
--     public.customers, public.service_tickets, public.inventory_items,
--     public.orders, public.spare_parts, public.shift_logs,
--     public.onsite_dispatches, public.blog_posts, public.blog_categories
--   TO anon;
-- ============================================================

-- ---------- customers (PII: no anonymous access at all) ----------
ALTER POLICY anon_select_customers ON public.customers TO authenticated;
ALTER POLICY anon_insert_customers ON public.customers TO authenticated;
ALTER POLICY anon_update_customers ON public.customers TO authenticated;
ALTER POLICY anon_delete_customers ON public.customers TO authenticated;

-- ---------- service_tickets (PII) ----------
ALTER POLICY anon_select_service_tickets ON public.service_tickets TO authenticated;
ALTER POLICY anon_insert_service_tickets ON public.service_tickets TO authenticated;
ALTER POLICY anon_update_service_tickets ON public.service_tickets TO authenticated;
ALTER POLICY anon_delete_service_tickets ON public.service_tickets TO authenticated;

-- ---------- orders (PII) ----------
ALTER POLICY anon_select_orders ON public.orders TO authenticated;
ALTER POLICY anon_insert_orders ON public.orders TO authenticated;
ALTER POLICY anon_update_orders ON public.orders TO authenticated;
ALTER POLICY anon_delete_orders ON public.orders TO authenticated;

-- ---------- shift_logs (payroll data) ----------
ALTER POLICY anon_select_shift_logs ON public.shift_logs TO authenticated;
ALTER POLICY anon_insert_shift_logs ON public.shift_logs TO authenticated;
ALTER POLICY anon_update_shift_logs ON public.shift_logs TO authenticated;
ALTER POLICY anon_delete_shift_logs ON public.shift_logs TO authenticated;

-- ---------- onsite_dispatches (customer addresses) ----------
ALTER POLICY anon_select_onsite_dispatches ON public.onsite_dispatches TO authenticated;
ALTER POLICY anon_insert_onsite_dispatches ON public.onsite_dispatches TO authenticated;
ALTER POLICY anon_update_onsite_dispatches ON public.onsite_dispatches TO authenticated;
ALTER POLICY anon_delete_onsite_dispatches ON public.onsite_dispatches TO authenticated;

-- ---------- inventory_items (public SELECT stays; writes staff-only) ----------
ALTER POLICY anon_insert_inventory_items ON public.inventory_items TO authenticated;
ALTER POLICY anon_update_inventory_items ON public.inventory_items TO authenticated;
ALTER POLICY anon_delete_inventory_items ON public.inventory_items TO authenticated;

-- ---------- spare_parts (public SELECT stays; writes staff-only) ----------
ALTER POLICY anon_insert_spare_parts ON public.spare_parts TO authenticated;
ALTER POLICY anon_update_spare_parts ON public.spare_parts TO authenticated;
ALTER POLICY anon_delete_spare_parts ON public.spare_parts TO authenticated;

-- ---------- blog (public reads stay; writes staff-only) ----------
ALTER POLICY "Allow full control for categories" ON public.blog_categories TO authenticated;
ALTER POLICY "Allow insert/update/delete for app services" ON public.blog_posts TO authenticated;

-- Make sure the public blog read policy really is published-only
DROP POLICY IF EXISTS "Public can read published blog_posts" ON public.blog_posts;
CREATE POLICY "Public can read published blog_posts"
  ON public.blog_posts FOR SELECT TO public
  USING (status = 'published');

-- ---------- Defense in depth: revoke anonymous grants ----------
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON
  public.customers, public.service_tickets, public.inventory_items,
  public.orders, public.spare_parts, public.shift_logs,
  public.onsite_dispatches, public.blog_posts, public.blog_categories
FROM anon;

REVOKE SELECT ON
  public.customers, public.service_tickets, public.orders,
  public.shift_logs, public.onsite_dispatches
FROM anon;
