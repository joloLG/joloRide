-- Fix Orders RLS Policies - Add Missing INSERT/UPDATE Policies
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Create comprehensive RLS policies for orders table
CREATE POLICY "Users can manage own orders" ON orders
  FOR ALL USING (
    user_id = (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    user_id = (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Riders can view assigned orders" ON orders
  FOR SELECT USING (
    rider_id = (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'rider'
    )
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Alternative approach if the above doesn't work:
-- More specific policies for each operation

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (
    user_id = (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update their own orders (limited to certain fields)
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (
    user_id = (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    user_id = (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    user_id = (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );
