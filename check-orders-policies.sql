-- Check and Fix Orders RLS Policies
-- Run this in Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'orders';

-- If the policies exist but aren't working, let's replace them
-- Drop existing policies one by one to avoid conflicts
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Recreate all policies with correct logic
-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update their own orders
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

-- Riders can view assigned orders
CREATE POLICY "Riders can view assigned orders" ON orders
  FOR SELECT USING (
    rider_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'rider'
    )
  );

-- Admins can do everything with orders
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
