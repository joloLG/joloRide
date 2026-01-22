-- Fix Order Items RLS Policies
-- Run this in Supabase SQL Editor

-- The order_items table needs RLS policies for order creation to work

-- Enable RLS if not already enabled
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items table

-- Users can view items for their own orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = order_items.order_id 
      AND p.user_id = auth.uid()
    )
  );

-- Users can create items for their own orders
CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = order_items.order_id 
      AND p.user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create order items
CREATE POLICY "Admins can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Riders can view items for assigned orders
CREATE POLICY "Riders can view assigned order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.rider_id
      WHERE o.id = order_items.order_id 
      AND p.user_id = auth.uid()
      AND p.role = 'rider'
    )
  );
