-- Orders RLS for rider "New Customer Orders" + claiming workflow
-- Run in Supabase SQL editor

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Helper: get current rider's profiles.id (works for both schemas)
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE(
    (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1),
    auth.uid()
  );
$$;

-- Helper: is the current user an active rider?
CREATE OR REPLACE FUNCTION public.is_active_rider()
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
      AND p.role = 'rider'
      AND COALESCE(p.is_active, false) = true
  );
$$;

-- Riders can see unassigned pending orders (the "New Customer Orders" feed)
DROP POLICY IF EXISTS "Riders can view unassigned pending orders" ON public.orders;
CREATE POLICY "Riders can view unassigned pending orders" ON public.orders
  FOR SELECT
  USING (
    public.is_active_rider()
    AND status = 'pending'
    AND rider_id IS NULL
  );

-- Riders can see their assigned orders
DROP POLICY IF EXISTS "Riders can view assigned orders" ON public.orders;
CREATE POLICY "Riders can view assigned orders" ON public.orders
  FOR SELECT
  USING (
    public.is_active_rider()
    AND rider_id = public.current_profile_id()
  );

-- Riders can claim/pass/cancel ONLY unassigned pending orders
DROP POLICY IF EXISTS "Riders can update unassigned pending orders" ON public.orders;
CREATE POLICY "Riders can update unassigned pending orders" ON public.orders
  FOR UPDATE
  USING (
    public.is_active_rider()
    AND status = 'pending'
    AND rider_id IS NULL
  )
  WITH CHECK (
    public.is_active_rider()
    AND (
      -- Confirm/claim
      (rider_id = public.current_profile_id() AND status IN ('confirmed','delivering','delivered'))
      OR
      -- Pass (leave unassigned)
      (rider_id IS NULL AND status = 'pending')
      OR
      -- Cancel (leave unassigned)
      (rider_id IS NULL AND status = 'cancelled')
    )
  );

-- Riders can update ONLY their own assigned orders (e.g., confirmed -> delivering -> delivered)
DROP POLICY IF EXISTS "Riders can update own assigned orders" ON public.orders;
CREATE POLICY "Riders can update own assigned orders" ON public.orders
  FOR UPDATE
  USING (
    public.is_active_rider()
    AND rider_id = public.current_profile_id()
  )
  WITH CHECK (
    rider_id = public.current_profile_id()
  );
