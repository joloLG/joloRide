-- Diagnostic script to check rider profile and order assignment issues
-- Run this to debug the RLS policy problems

-- Check current user's profile
SELECT 
  id,
  user_id,
  email,
  role,
  is_active,
  created_at,
  updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- Check the specific order that's failing
SELECT 
  id,
  user_id,
  rider_id,
  status,
  created_at,
  updated_at
FROM orders 
WHERE id = '77747340-7bfa-40f3-bb48-d37b323e8076';

-- Check if the current user is the rider for this order
SELECT 
  o.id as order_id,
  o.rider_id,
  p.user_id as rider_user_id,
  p.role as rider_role,
  CASE 
    WHEN o.rider_id = auth.uid() THEN 'Current user is rider'
    WHEN o.rider_id IS NULL THEN 'No rider assigned'
    ELSE 'Different rider assigned'
  END as rider_status
FROM orders o
LEFT JOIN profiles p ON p.id = o.rider_id
WHERE o.id = '77747340-7bfa-40f3-bb48-d37b323e8076';

-- Check all existing RLS policies on orders table
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
WHERE tablename = 'orders';

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'orders';

-- Test the current user's permissions
SELECT 
  has_table_privilege('authenticated', 'orders', 'SELECT') as can_select,
  has_table_privilege('authenticated', 'orders', 'INSERT') as can_insert,
  has_table_privilege('authenticated', 'orders', 'UPDATE') as can_update,
  has_table_privilege('authenticated', 'orders', 'DELETE') as can_delete;

-- Check if there are any database triggers that might be causing issues
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_condition,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders';
