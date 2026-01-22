-- Fix Orders RLS - Add Missing INSERT Policy Only
-- Run this in Supabase SQL Editor

-- Just add the missing INSERT policy for users to create orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (
    user_id = (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Also add UPDATE policy if it doesn't exist
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
