-- Fix Existing Orders RLS Policies
-- Run this in Supabase SQL Editor

-- The issue is that existing policies use wrong logic and INSERT policy has no WITH CHECK

-- Drop and recreate user policies with correct logic
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Recreate user policies with correct profile lookup
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

-- Also add UPDATE policy for users (if it doesn't exist)
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );
