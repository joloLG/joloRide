-- Sample Data for JoloRide Testing
-- Run this script in Supabase SQL Editor to populate test data

-- Insert Sample Stores
INSERT INTO stores (id, name, description, cover_image, is_featured, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Jolo Food Express', 'Fast food delivery in Bulan', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', 'Fresh Market Grocery', 'Fresh groceries and essentials', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'Bulan Bakery', 'Fresh breads and pastries', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', false, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440004', 'Pinoy Restaurant', 'Authentic Filipino cuisine', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440005', 'Quick Mart', 'Convenience store items', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', false, '550e8400-e29b-41d4-a716-446655440000');

-- Insert Sample Products
INSERT INTO products (id, store_id, name, description, price, image_url, is_available) VALUES
-- Jolo Food Express Products
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Burger Combo', 'Classic burger with fries and drink', 150, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Chicken Wings', '6 pieces of crispy chicken wings', 120, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Pizza Slice', 'Pepperoni pizza slice', 80, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', true),

-- Fresh Market Grocery Products
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Fresh Eggs', '1 dozen fresh eggs', 65, 'https://images.unsplash.com/photo-1518569656558-1f25e69393e7?w=400', true),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Rice 5kg', 'Premium white rice 5kg', 250, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', true),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Cooking Oil', '1 liter cooking oil', 85, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', true),

-- Bulan Bakery Products
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Pandesal', '10 pieces fresh pandesal', 35, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', true),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Ensaymada', 'Sweet ensaymada 3 pieces', 45, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', true),

-- Pinoy Restaurant Products
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'Adobo', 'Classic Filipino adobo with rice', 95, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', true),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'Sinigang', 'Pork sinigang soup with rice', 110, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', true),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004', 'Pancit', 'Filipino stir-fried noodles', 85, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', true),

-- Quick Mart Products
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005', 'Bottled Water', '1 liter purified water', 15, 'https://images.unsplash.com/photo-1548839149-2c6140f4b862?w=400', true),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 'Soft Drinks', 'Assorted soft drinks 1.5L', 45, 'https://images.unsplash.com/photo-1548839149-2c6140f4b862?w=400', true),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'Chips', 'Potato chips assorted', 35, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', true);

-- Insert Delivery Fees for Bulan Barangays
INSERT INTO delivery_fees (barangay, fee) VALUES
('Poblacion', 30),
('Aguada Norte', 35),
('Aguada Sur', 35),
('Bagacay', 40),
('Bangon', 40),
('Bano', 45),
('Bonga', 35),
('Butag', 40),
('Cagang', 45),
('Calangay', 40),
('Calzada', 30),
('Camcam', 45),
('Cataingan', 40),
('Cawayan', 45),
('Dacdac', 50),
('Del Rosario', 35),
('Denic', 50),
('Ginabutan', 45),
('Guinlajon', 35),
('Imelda', 40),
('Jabonga', 45),
('Layog', 50),
('Lombos', 40),
('Magsaysay', 35),
('Malbong', 45),
('Marinab', 40),
('Monreal', 35),
('Obrero', 30),
('Paghabol', 45),
('Pondol', 40),
('Sabang', 35),
('San Francisco', 30),
('San Isidro', 40),
('San Juan', 35),
('San Rafael', 40),
('San Roque', 35),
('San Vicente', 40),
('Santa Cruz', 30),
('Santa Elena', 35),
('Santa Justa', 45),
('Santa Lutgarda', 50),
('Santo Domingo', 35),
('Santo Niño', 40),
('Siclong', 45),
('Tagdon', 50),
('Talisay', 40),
 'Tandaay', 45),
('Taros', 50),
('Zone 1', 30),
('Zone 2', 30),
('Zone 3', 30),
('Zone 4', 30),
('Zone 5', 30),
('Zone 6', 30),
('Zone 7', 30),
('Zone 8', 30);

-- Update Hero Settings
UPDATE hero_settings SET 
  title = 'Welcome to JoloRide',
  subtitle = 'Fast & Reliable Food & Grocery Delivery in Bulan',
  background_color = '#f97316',
  background_image = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200';

-- Sample Reviews
INSERT INTO reviews (id, product_id, user_id, rating, comment) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5, 'Delicious burger! Fast delivery too.'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 4, 'Good food, reasonable price.'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 5, 'Fresh eggs every time!'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 5, 'Authentic Filipino taste!'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 4, 'Fresh pandesal every morning.');

-- Sample Rider (for testing order assignment)
INSERT INTO riders (id, status, last_assigned, daily_completed, daily_earnings) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'ACTIVE', null, 0, 0);

-- Sample Rider Profile
INSERT INTO profiles (id, role, full_name, mobile, address, lat, lng) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'rider', 'Juan Rider', '09123456789', 'Poblacion, Bulan, Sorsogon', 12.6767, 123.9649);

-- Sample Admin Profile
INSERT INTO profiles (id, role, full_name, mobile, address, lat, lng) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'admin', 'Admin User', '09987654321', 'Poblacion, Bulan, Sorsogon', 12.6767, 123.9649);
