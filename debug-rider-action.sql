-- Debug Rider Order Action
-- This helps identify why the rider action is failing with empty error

-- First, check the current auth context
SELECT 
  'Auth Context' as debug_info,
  auth.uid() as current_uid,
  auth.role() as current_role,
  CASE 
    WHEN auth.uid() IS NULL THEN 'NO AUTH CONTEXT'
    ELSE 'AUTH CONTEXT AVAILABLE'
  END as auth_status;

-- Check the current rider's profile
SELECT 
  'Rider Profile Check' as debug_info,
  id,
  user_id,
  email,
  role,
  is_active,
  created_at
FROM profiles 
WHERE user_id = auth.uid() OR id = auth.uid();

-- Check if there are any pending orders
SELECT 
  'Pending Orders' as debug_info,
  COUNT(*) as pending_count,
  array_agg(id) as pending_order_ids
FROM orders 
WHERE status = 'pending' AND rider_id IS NULL;

-- Check the specific order that might be getting confirmed
SELECT 
  'Recent Orders' as debug_info,
  id,
  user_id,
  rider_id,
  status,
  created_at,
  updated_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Test if we can manually update an order (simulate what the app does)
-- This will help identify if the issue is with permissions or logic
SELECT 
  'Manual Update Test' as debug_info,
  'Testing if we can update an order directly...' as test_status;

-- Try to update a test order (uncomment to test)
-- UPDATE orders 
-- SET rider_id = 'test-rider-id', status = 'confirmed'
-- WHERE id = 'your-order-id' AND rider_id IS NULL;

-- Check if there are any database constraints that might be causing issues
SELECT 
  'Constraints Check' as debug_info,
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'orders';
