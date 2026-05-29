-- ─── Gurjar Connect — Security & Performance Fixes ──────────────────────────
-- Review, then run in the Supabase SQL Editor (or approve Claude to apply).
-- These were surfaced by Supabase's own security/performance advisors plus a
-- manual review of the RLS policies. All statements are idempotent.
--
-- NOTE: This file reflects fixes to the LIVE schema (profiles + members.profile_url
-- + members.claimed_by), which differs from the stale committed `supabase-schema.sql`.
-- That older file should be regenerated from the live DB separately.

-- ══ 1. SECURITY ═══════════════════════════════════════════════════════════════

-- 1a. Remove the public INSERT policy on members.
--     The anon key ships in the browser, so `WITH CHECK (true)` let ANYONE insert
--     rows into the public directory. All legitimate member writes go through
--     server routes using the service role (which bypasses RLS), so this policy
--     only ever served attackers.
DROP POLICY IF EXISTS members_insert_admin ON public.members;

-- 1b. Stop exposing the SECURITY DEFINER trigger function over the REST RPC API.
--     handle_new_user() should only ever run from the on_auth_user_created trigger.
--     Revoking EXECUTE does NOT affect trigger firing.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;


-- ══ 2. PERFORMANCE ════════════════════════════════════════════════════════════

-- 2a. Cover the foreign key members.claimed_by with an index.
CREATE INDEX IF NOT EXISTS idx_members_claimed_by ON public.members (claimed_by);

-- 2b. Wrap auth.uid() in a scalar sub-select so Postgres evaluates it ONCE per
--     query instead of once per row (advisor: auth_rls_initplan). Behaviour is
--     identical; only the query plan improves at scale.

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS registrations_select_own ON public.registrations;
CREATE POLICY registrations_select_own ON public.registrations
  FOR SELECT USING (
    linkedin_url IN (
      SELECT linkedin_url FROM public.profiles WHERE id = (SELECT auth.uid())
    )
  );

-- ── Optional (Auth setting, not SQL): enable leaked-password protection in
--    Dashboard → Authentication → Policies. Low priority since auth is OAuth-only.
