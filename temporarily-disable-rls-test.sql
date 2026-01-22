-- TEMPORARY FIX: Disable RLS for testing
-- ONLY USE THIS TO TEST IF THE LOGIC WORKS, THEN RE-ENABLE PROPERLY

-- Step 1: Temporarily disable RLS on orders table
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Step 2: Temporarily disable RLS on order_status_history table  
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_status_history TO authenticated;

-- Step 4: Test the rider confirmation
-- After running this, try confirming the order in the app
-- If it works, the issue is definitely with RLS policies
-- If it still fails, the issue is elsewhere

-- STEP 5: RE-ENABLE RLS AFTER TESTING (IMPORTANT!)
-- Uncomment and run these lines after testing:
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- For now, let's see what happens with RLS disabled
SELECT 
  'RLS Status' as info_type,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'orders') as orders_rls_enabled,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'order_status_history') as order_status_history_rls_enabled,
  'RLS temporarily disabled for testing' as note;
