-- Fix Admin Logs Foreign Key Constraint Issues
-- Run this in Supabase SQL Editor

-- 1. First, check if we need to update the trigger function to handle missing profiles
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if the user exists in profiles table
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() OR id = auth.uid()
  ) THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO admin_logs (admin_id, action, table_name, record_id, new_values)
      VALUES (
        (SELECT COALESCE(
          (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1),
          auth.uid()
        )), 
        'create', 
        TG_TABLE_NAME, 
        NEW.id, 
        row_to_json(NEW)
      );
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      INSERT INTO admin_logs (admin_id, action, table_name, record_id, old_values, new_values)
      VALUES (
        (SELECT COALESCE(
          (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1),
          auth.uid()
        )), 
        'update', 
        TG_TABLE_NAME, 
        NEW.id, 
        row_to_json(OLD), 
        row_to_json(NEW)
      );
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO admin_logs (admin_id, action, table_name, record_id, old_values)
      VALUES (
        (SELECT COALESCE(
          (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1),
          auth.uid()
        )), 
        'delete', 
        TG_TABLE_NAME, 
        OLD.id, 
        row_to_json(OLD)
      );
      RETURN OLD;
    END IF;
  END IF;
  
  -- If no profile exists, skip logging but allow the operation
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update admin_logs RLS policies to be more permissive for inserts
DROP POLICY IF EXISTS "Admins can view admin logs" ON admin_logs;
DROP POLICY IF EXISTS "Admins can insert admin logs" ON admin_logs;

CREATE POLICY "Admins can view admin logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE (user_id = auth.uid() OR id = auth.uid()) AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert admin logs" ON admin_logs
  FOR INSERT WITH CHECK (
    admin_id = (
      SELECT COALESCE(
        (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1),
        auth.uid()
      )
    )
  );

-- 3. Make admin_logs foreign key constraint nullable or update it
-- Option A: Make foreign key nullable (safer)
ALTER TABLE admin_logs ALTER COLUMN admin_id DROP NOT NULL;

-- Option B: Update the foreign key to allow any UUID (commented out, use if needed)
-- ALTER TABLE admin_logs DROP CONSTRAINT admin_logs_admin_id_fkey;
-- ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_admin_id_fkey 
--   FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Ensure current admin user has a profile entry
-- This creates a profile for the current authenticated user if it doesn't exist
-- Only runs if there's an authenticated user
DO $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO profiles (id, user_id, email, role, full_name, created_at)
    SELECT 
      auth.uid(),
      auth.uid(),
      auth.email(),
      'admin',
      COALESCE(SPLIT_PART(auth.email(), '@', 2), 'Admin'),
      NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() OR id = auth.uid()
    );
  END IF;
END $$;

-- 5. Test the fix by creating a simple store
-- This should work now without foreign key errors
-- You can run this test query to verify:
-- INSERT INTO stores (name, image, is_featured) 
-- VALUES ('Test Store', 'https://example.com/image.jpg', false);
