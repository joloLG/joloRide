-- Add landmark field to orders table
-- Run this in Supabase SQL Editor

-- Add landmark column to orders table
ALTER TABLE orders 
ADD COLUMN landmark TEXT;

-- Update RLS policies to include landmark (if needed)
-- The existing policies should work fine since we're just adding a column

-- Example query to test the new field
-- INSERT INTO orders (user_id, dropoff_address, dropoff_lat, dropoff_lng, landmark, barangay, total_amount, delivery_fee, payment_method, status)
-- VALUES (
--   'your-user-id',
--   '123 Main St',
--   12.8797,
--   124.1423,
--   'Near Jollibee',
--   'Poblacion Central',
--   150.00,
--   40.00,
--   'COD',
--   'PENDING'
-- );
