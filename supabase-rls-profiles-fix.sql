-- Fix profiles RLS (remove recursion) + enforce user_id consistency
-- Run this in Supabase SQL editor

-- Replace recursive policies on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin insert" ON public.profiles;

-- Helper function to avoid recursion inside RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE (p.user_id = auth.uid() OR p.id = auth.uid())
      AND p.role = 'admin'
  );
$$;

-- Users: can select/insert/update their own profile
CREATE POLICY "Profiles select own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = id);

CREATE POLICY "Profiles insert own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = id);

CREATE POLICY "Profiles update own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = id);

-- Admins: can select/update all profiles
CREATE POLICY "Profiles admin select" ON public.profiles
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Profiles admin update" ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- Optional: allow admins to insert profiles (for rider/admin creation flows)
CREATE POLICY "Profiles admin insert" ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());
