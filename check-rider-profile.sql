-- Check rider profile and order assignment compatibility
-- This helps identify why RLS policies are failing

-- Check current user's profile structure
SELECT 
  'Current User Profile' as info_type,
  id,
  user_id,
  email,
  role,
  is_active,
  last_order_at,
  created_at,
  updated_at
FROM profiles 
WHERE user_id = auth.uid();

-- Check if the current user has both id and user_id set correctly
SELECT 
  'Profile ID Check' as info_type,
  CASE 
    WHEN id = user_id THEN 'ID and User ID are the same'
    WHEN id IS NULL THEN 'ID is NULL - PROBLEM'
    WHEN user_id IS NULL THEN 'User ID is NULL - PROBLEM'
    ELSE 'ID and User ID are different'
  END as id_status,
  id,
  user_id
FROM profiles 
WHERE user_id = auth.uid();

-- Check the specific order that's failing
SELECT 
  'Problem Order Details' as info_type,
  id,
  user_id,
  rider_id,
  status,
  created_at,
  updated_at
FROM orders 
WHERE id = '77747340-7bfa-40f3-bb48-d37b323e8076';

-- Test if current user can access this order with different conditions
SELECT 
  'Order Access Test' as info_type,
  CASE 
    WHEN user_id = auth.uid() THEN 'User owns this order'
    WHEN rider_id = auth.uid() THEN 'User is assigned rider'
    WHEN rider_id IS NULL THEN 'Order is unassigned (rider can confirm)'
    ELSE 'No direct access to this order'
  END as access_type,
  user_id,
  rider_id,
  auth.uid() as current_user_id
FROM orders 
WHERE id = '77747340-7bfa-40f3-bb48-d37b323e8076';

-- Check all unassigned orders (what rider should see)
SELECT 
  'Unassigned Orders Count' as info_type,
  COUNT(*) as count
FROM orders 
WHERE rider_id IS NULL AND status = 'pending';

-- Check if there are any profile issues for riders
SELECT 
  'Rider Profile Issues' as info_type,
  COUNT(*) as riders_with_issues,
  array_agg(id) as problematic_rider_ids
FROM profiles 
WHERE role = 'rider' AND (id IS NULL OR user_id IS NULL);

-- Test the RLS policy condition directly
SELECT 
  'RLS Policy Test' as info_type,
  auth.uid() as current_auth_uid,
  (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'rider' AND is_active = true LIMIT 1) as rider_profile_id,
  CASE 
    WHEN auth.uid() IN (SELECT id FROM profiles WHERE user_id = auth.uid() AND role = 'rider' AND is_active = true) 
    THEN 'Rider passes RLS condition'
    ELSE 'Rider fails RLS condition'
  END as rls_test_result;
