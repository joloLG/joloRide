-- Fix RLS policies for riders to update orders table
-- This allows riders to update their assigned orders

-- Drop existing rider policies on orders if they exist
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Riders can update assigned orders" ON orders;

-- Create comprehensive rider policies for orders
CREATE POLICY "Riders can view assigned orders" ON orders
  FOR SELECT USING (
    rider_id = auth.uid()
  );

CREATE POLICY "Riders can update assigned orders" ON orders
  FOR UPDATE USING (
    rider_id = auth.uid()
  );

CREATE POLICY "Riders can insert order status history" ON orders
  FOR INSERT WITH CHECK (
    rider_id = auth.uid()
  );

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON orders TO authenticated;
