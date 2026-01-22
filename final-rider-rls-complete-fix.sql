-- FINAL COMPLETE RLS FIX for Rider Order Confirmation
-- This addresses both the orders table RLS and the trigger-induced order_status_history RLS issues

-- Step 1: Fix orders table RLS policies
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Riders can update assigned orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for orders table
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid()
    )
  );

-- KEY FIX: Allow riders to update unassigned orders (for confirmation) AND their assigned orders
CREATE POLICY "Riders can view assigned orders" ON orders
  FOR SELECT USING (
    rider_id = auth.uid()
  );

CREATE POLICY "Riders can update assigned orders" ON orders
  FOR UPDATE USING (
    rider_id = auth.uid() OR 
    (rider_id IS NULL AND auth.uid() IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'rider' AND is_active = true
    ))
  );

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 2: Fix order_status_history table RLS policies (CRITICAL for triggers)
DROP POLICY IF EXISTS "Users can view own order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can view order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can update own order status history" ON order_status_history;
DROP POLICY IF EXISTS "Admins can view all order status history" ON order_status_history;

-- Ensure RLS is enabled
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- KEY FIX: Allow riders to insert status history for orders they're confirming OR assigned to
CREATE POLICY "Users can view own order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = order_status_history.order_id 
      AND p.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Riders can view order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND o.rider_id = auth.uid()
    )
  );

-- CRITICAL FIX: Allow riders to insert status history for orders they're confirming
CREATE POLICY "Riders can insert order status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND (
        o.rider_id = auth.uid() OR
        -- Allow insertion when rider is confirming an unassigned order
        (o.rider_id IS NULL AND auth.uid() IN (
          SELECT id FROM profiles 
          WHERE user_id = auth.uid() AND role = 'rider' AND is_active = true
        ))
      )
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

CREATE POLICY "Admins can view all order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 3: Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_status_history TO authenticated;

-- Step 4: Test the fix by checking current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('orders', 'order_status_history')
ORDER BY tablename, policyname;
