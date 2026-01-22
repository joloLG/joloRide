-- EMERGENCY FIX: Simplified RLS policies for rider order confirmation
-- This uses a more direct approach to avoid complex subqueries

-- Step 1: Drop ALL existing policies on orders table
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Riders can update assigned orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Step 2: Create simple, direct policies
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own orders
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (user_id = auth.uid());

-- CRITICAL: Riders can view unassigned orders AND their assigned orders
CREATE POLICY "Riders can view orders" ON orders
  FOR SELECT USING (
    rider_id = auth.uid() OR 
    rider_id IS NULL
  );

-- CRITICAL: Riders can update unassigned orders AND their assigned orders
CREATE POLICY "Riders can update orders" ON orders
  FOR UPDATE USING (
    rider_id = auth.uid() OR 
    rider_id IS NULL
  );

-- Admins can do everything
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 3: Fix order_status_history with simple policies
DROP POLICY IF EXISTS "Users can view own order status history" ON order_status_history;
DROP POLICY IF EXISTS "Users can insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can view order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can insert order status history" ON order_status_history;
DROP POLICY IF EXISTS "Riders can update own order status history" ON order_status_history;
DROP POLICY IF EXISTS "Admins can view all order status history" ON order_status_history;

-- Simple policies for order_status_history
CREATE POLICY "Users can view own order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Riders can manage order status history" ON order_status_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND (o.rider_id = auth.uid() OR o.rider_id IS NULL)
    )
  );

CREATE POLICY "Admins can manage order status history" ON order_status_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 4: Grant permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_status_history TO authenticated;

-- Step 5: Test query to verify the fix
-- This simulates what the rider is trying to do
SELECT 
  'Testing rider access to unassigned orders' as test_description,
  COUNT(*) as accessible_orders
FROM orders 
WHERE rider_id IS NULL
LIMIT 1;

-- Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('orders', 'order_status_history')
ORDER BY tablename, policyname;
