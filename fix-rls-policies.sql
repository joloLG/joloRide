-- Fix RLS Policies for JoloRide Backend Issues
-- Run this in Supabase SQL Editor

-- 1. Fix admin_logs RLS policies (missing policies causing violation)
CREATE POLICY "Admins can view admin logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert admin logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Fix hero_settings RLS - add missing admin policies
DROP POLICY IF EXISTS "Public read hero" ON hero_settings;
DROP POLICY IF EXISTS "Admin update hero" ON hero_settings;

CREATE POLICY "Public read hero settings" ON hero_settings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage hero settings" ON hero_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Fix stores table schema mismatch - add image column if missing
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Update image column to match cover_image for existing records
UPDATE stores 
SET image = cover_image 
WHERE image IS NULL AND cover_image IS NOT NULL;

-- 4. Fix products table schema mismatch - add image_url column if missing
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update image_url column to match image for existing records  
UPDATE products 
SET image_url = image 
WHERE image_url IS NULL AND image IS NOT NULL;

-- 5. Add storage policies for image uploads
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;

CREATE POLICY "Public read storage objects" ON storage.objects
  FOR SELECT USING (bucket_id IN ('products', 'stores', 'hero'));

CREATE POLICY "Admins can upload storage objects" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('products', 'stores', 'hero')
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update storage objects" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('products', 'stores', 'hero')
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete storage objects" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('products', 'stores', 'hero')
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('products', 'products', true),
  ('stores', 'stores', true), 
  ('hero', 'hero', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Fix admin_logs foreign key constraint and trigger issues
-- Make admin_id nullable to avoid constraint violations
ALTER TABLE admin_logs ALTER COLUMN admin_id DROP NOT NULL;

-- Update trigger function to handle missing profiles gracefully
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

-- Ensure current admin user has a profile entry
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

-- 8. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
