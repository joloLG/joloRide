-- Fix RLS policies for riders to update order status
-- This allows riders to trigger order_status_history inserts through database triggers

-- Drop existing rider policies on order_status_history if they exist
DROP POLICY IF EXISTS "Riders can view order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can insert order status history" ON order_status_history;

-- Create comprehensive rider policies for order_status_history
CREATE POLICY "Riders can view order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND o.rider_id = auth.uid()
    )
  );

CREATE POLICY "Riders can insert order status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND o.rider_id = auth.uid()
    )
  );

CREATE POLICY "Riders can update own order status history" ON order_status_history
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND o.rider_id = auth.uid()
    )
  );

-- Also ensure riders can update orders (this should exist but let's verify)
DROP POLICY IF EXISTS "Riders can update assigned orders" ON orders;
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;

CREATE POLICY "Riders can view assigned orders" ON orders
  FOR SELECT USING (
    rider_id = auth.uid()
  );

CREATE POLICY "Riders can update assigned orders" ON orders
  FOR UPDATE USING (
    rider_id = auth.uid()
  );

-- Grant necessary permissions to authenticated users
GRANT ALL ON order_status_history TO authenticated;
GRANT ALL ON orders TO authenticated;
