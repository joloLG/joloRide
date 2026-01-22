-- Fix Order Status History RLS Policies
-- Run this in Supabase SQL Editor

-- The order_status_history table needs RLS policies for the trigger to work

-- Enable RLS if not already enabled
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for order_status_history table

-- Users can view status history for their own orders
CREATE POLICY "Users can view own order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = order_status_history.order_id 
      AND p.user_id = auth.uid()
    )
  );

-- Users can create status history for their own orders (for triggers)
CREATE POLICY "Users can create own order status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = order_status_history.order_id 
      AND p.user_id = auth.uid()
    )
  );

-- Admins can view all order status history
CREATE POLICY "Admins can view all order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create order status history
CREATE POLICY "Admins can create order status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Riders can view status history for assigned orders
CREATE POLICY "Riders can view assigned order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.rider_id
      WHERE o.id = order_status_history.order_id 
      AND p.user_id = auth.uid()
      AND p.role = 'rider'
    )
  );
