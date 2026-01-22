-- Final Fix for Orders RLS Policies
-- Run this in Supabase SQL Editor

-- Only drop and recreate the policies that are broken
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Recreate only the broken user policies with correct logic
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Don't touch the UPDATE policy since it already exists
-- Don't touch rider/admin policies since they're working
