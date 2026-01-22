-- Debug Supabase Authentication Issue
-- This helps identify why auth.uid() is null

-- Check current auth context
SELECT 
  'Current Auth Context' as debug_info,
  auth.uid() as uid,
  auth.role() as role,
  auth.email() as email,
  CASE 
    WHEN auth.uid() IS NULL THEN 'NO AUTH CONTEXT'
    ELSE 'AUTH CONTEXT AVAILABLE'
  END as auth_status;

-- Check if there are any JWT claims
SELECT 
  'JWT Claims Check' as debug_info,
  current_setting('request.jwt.claims', true) as jwt_claims;

-- Check session info
SELECT 
  'Session Info' as debug_info,
  current_setting('request.headers', true) as headers;

-- Test basic query without RLS
SELECT 
  'Basic Query Test' as debug_info,
  COUNT(*) as total_orders
FROM orders;

-- Test query with RLS (should fail if auth.uid() is null)
SELECT 
  'RLS Query Test' as debug_info,
  COUNT(*) as my_orders
FROM orders 
WHERE user_id = auth.uid();
