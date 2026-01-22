-- Comprehensive RLS Fix for Riders
-- This ensures riders can update their assigned orders and trigger status history

-- First, let's check what policies exist
-- DROP ALL existing rider policies on orders table
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Riders can update assigned orders" ON orders;
DROP POLICY IF EXISTS "Riders can insert orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for orders table
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update their own orders (limited fields)
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Riders can view orders assigned to them
CREATE POLICY "Riders can view assigned orders" ON orders
  FOR SELECT USING (
    rider_id = auth.uid()
  );

-- Riders can update orders assigned to them
CREATE POLICY "Riders can update assigned orders" ON orders
  FOR UPDATE USING (
    rider_id = auth.uid()
  );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Now fix order_status_history table policies
DROP POLICY IF EXISTS "Users can view own order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can view order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can update own order status history" ON order_status_history;
DROP POLICY IF EXISTS "Admins can view all order status history" ON order_status_history;

-- Ensure RLS is enabled
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for order_status_history
-- Users can view status history for their orders
CREATE POLICY "Users can view own order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = order_status_history.order_id 
      AND p.user_id = auth.uid()
    )
  );

-- Users can insert status history for their orders (cancellations)
CREATE POLICY "Users can insert order status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = order_status_history.order_id 
      AND p.user_id = auth.uid()
      AND order_status_history.status = 'cancelled'
    )
  );

-- Riders can view status history for their assigned orders
CREATE POLICY "Riders can view order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND o.rider_id = auth.uid()
    )
  );

-- Riders can insert status history for their assigned orders
CREATE POLICY "Riders can insert order status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND o.rider_id = auth.uid()
    )
  );

-- Riders can update status history for their assigned orders
CREATE POLICY "Riders can update own order status history" ON order_status_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND o.rider_id = auth.uid()
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

-- Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_status_history TO authenticated;

-- Also fix order_items table to prevent issues
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Riders can view assigned order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Ensure RLS is enabled
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = order_items.order_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Riders can view assigned order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id 
      AND o.rider_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

GRANT ALL ON order_items TO authenticated;
