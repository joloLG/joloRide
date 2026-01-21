-- JoloRide Delivery App - Complete Database Schema
-- Supports User, Rider, and Admin roles with all specified features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main profiles table for all user types
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  mobile TEXT,
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'rider', 'admin')),
  is_active BOOLEAN DEFAULT true,
  
  -- Rider-specific fields
  daily_quota INTEGER DEFAULT 10,
  total_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  last_order_at TIMESTAMP WITH TIME ZONE,
  
  -- User-specific fields for recommendations
  last_searched_items TEXT[], -- Array of recently searched product IDs
  favorite_stores UUID[], -- Array of favorite store IDs
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores table for shop management
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  cover_image TEXT,
  is_featured BOOLEAN DEFAULT false,
  category TEXT, -- 'food', 'grocery', 'pharmacy', 'convenience'
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  delivery_time TEXT DEFAULT '20-30 min',
  delivery_fee DECIMAL(10, 2) DEFAULT 40.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  category TEXT,
  tags TEXT[], -- For better search functionality
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0, -- For recommendation algorithm
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product reviews and ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- One review per user per product
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivering', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'QRPH')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  
  -- Delivery location
  dropoff_address TEXT NOT NULL,
  dropoff_lat DECIMAL(10, 8),
  dropoff_lng DECIMAL(11, 8),
  
  -- Timestamps for order tracking
  confirmed_at TIMESTAMP WITH TIME ZONE,
  delivering_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time DECIMAL(10, 2) NOT NULL, -- Price snapshot when ordered
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table for persistent shopping carts
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Delivery fees by barangay (Bulan, Sorsogon specific)
CREATE TABLE delivery_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barangay TEXT NOT NULL UNIQUE,
  fee DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero settings for customizable welcome banner
CREATE TABLE hero_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  background_color TEXT DEFAULT '#3B82F6',
  background_image TEXT,
  title TEXT,
  subtitle TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User search history for recommendations
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rider queue management for fair order distribution
CREATE TABLE rider_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  last_order_at TIMESTAMP WITH TIME ZONE,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history for tracking
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id), -- User or rider who changed status
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'delivery', 'payment', 'system')),
  is_read BOOLEAN DEFAULT false,
  data JSONB, -- Additional data like order_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default hero settings
INSERT INTO hero_settings (background_color, title, subtitle) 
VALUES ('#3B82F6', 'Welcome to JoloRide', 'Your favorite delivery service in Bulan, Sorsogon');

-- Insert default delivery fees for Bulan barangays (sample data)
INSERT INTO delivery_fees (barangay, fee) VALUES 
('Aguada', 40.00),
('Bagacay', 45.00),
('Bariis', 50.00),
('Combado', 35.00),
('Denug', 55.00),
('Gabon', 40.00),
('Imelda', 45.00),
('Ladgarao', 60.00),
('Lagundi', 50.00),
('Layuan', 55.00),
('Mabini', 40.00),
('Magallanes', 45.00),
('Malbog', 50.00),
('Namo', 55.00),
('Otog', 60.00),
('Pag-asa', 40.00),
('Palomtas', 45.00),
('Panan-awan', 35.00),
('Poblacion Central', 30.00),
('Sabang', 40.00),
('San Antonio', 45.00),
('San Francisco', 50.00),
('San Isidro', 55.00),
('San Juan', 40.00),
('San Nicolas', 45.00),
('San Ramon', 50.00),
('San Roque', 40.00),
('San Vicente', 45.00),
('Santa Cruz', 50.00),
('Santa Elena', 55.00),
('Santo Cristo', 40.00),
('Santo Niño', 45.00),
('Siclong', 50.00),
('Tagalog', 55.00),
('Talisay', 40.00),
('Tanawan', 45.00),
('Tapaan', 50.00),
('Tarosanan', 55.00),
('Tizon', 40.00),
('Tugas', 45.00);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_stores_is_featured ON stores(is_featured);
CREATE INDEX idx_stores_is_active ON stores(is_active);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_rider_id ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can see their own profile, admins can see all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Stores: Public read, admin write
CREATE POLICY "Stores are publicly viewable" ON stores
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stores" ON stores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Products: Public read for available products, admin write
CREATE POLICY "Available products are publicly viewable" ON products
  FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Reviews: Users can manage their own reviews
CREATE POLICY "Users can manage own reviews" ON reviews
  FOR ALL USING (user_id = auth.uid());

-- Orders: Users can see their own orders, riders can see assigned orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Riders can view assigned orders" ON orders
  FOR SELECT USING (rider_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Cart items: Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (user_id = auth.uid());

-- Search history: Users can view their own history
CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own search history" ON search_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications: Users can manage their own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Functions and triggers for automatic updates

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_fees_updated_at BEFORE UPDATE ON delivery_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_settings_updated_at BEFORE UPDATE ON hero_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews 
      WHERE product_id = NEW.product_id
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating when review is added/updated
CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to update store ratings
CREATE OR REPLACE FUNCTION update_store_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stores 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE p.store_id = NEW.store_id
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE p.store_id = NEW.store_id
    )
  WHERE id = NEW.store_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update store rating when product review is added/updated
CREATE TRIGGER update_store_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to manage rider queue
CREATE OR REPLACE FUNCTION update_rider_queue()
RETURNS TRIGGER AS $$
BEGIN
  -- When rider confirms an order, move them to end of queue
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.rider_id IS NOT NULL THEN
    UPDATE rider_queue 
    SET position = (
      SELECT COALESCE(MAX(position), 0) + 1 
      FROM rider_queue
    ),
    last_order_at = NOW()
    WHERE rider_id = NEW.rider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rider queue management
CREATE TRIGGER manage_rider_queue_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_rider_queue();

-- Function to create order status history
CREATE OR REPLACE FUNCTION create_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_status_history (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, NEW.user_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO order_status_history (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, NEW.rider_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order status history
CREATE TRIGGER create_order_status_history_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_order_status_history();

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO admin_logs (admin_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'create', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO admin_logs (admin_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'update', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO admin_logs (admin_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'delete', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for admin logging on key tables
CREATE TRIGGER log_stores_activity
  AFTER INSERT OR UPDATE OR DELETE ON stores
  FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

CREATE TRIGGER log_products_activity
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

CREATE TRIGGER log_delivery_fees_activity
  AFTER INSERT OR UPDATE OR DELETE ON delivery_fees
  FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

CREATE TRIGGER log_hero_settings_activity
  AFTER INSERT OR UPDATE OR DELETE ON hero_settings
  FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

-- Views for common queries

-- View for products with store information
CREATE VIEW product_details AS
SELECT 
  p.*,
  s.name as store_name,
  s.image as store_image,
  s.delivery_time,
  s.delivery_fee as store_delivery_fee
FROM products p
JOIN stores s ON p.store_id = s.id
WHERE p.is_available = true AND s.is_active = true;

-- View for order details with items
CREATE VIEW order_details AS
SELECT 
  o.*,
  u.full_name as customer_name,
  u.mobile as customer_mobile,
  u.address as customer_address,
  r.full_name as rider_name,
  r.mobile as rider_mobile
FROM orders o
LEFT JOIN profiles u ON o.user_id = u.id
LEFT JOIN profiles r ON o.rider_id = r.id;

-- View for rider statistics
CREATE VIEW rider_stats AS
SELECT 
  p.id as rider_id,
  p.full_name,
  p.mobile,
  p.is_active,
  p.daily_quota,
  COUNT(o.id) as total_orders,
  COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN o.created_at >= CURRENT_DATE THEN 1 END) as today_orders,
  COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.delivery_fee END), 0) as total_earnings,
  COALESCE(SUM(CASE WHEN o.created_at >= CURRENT_DATE AND o.status = 'delivered' THEN o.delivery_fee END), 0) as today_earnings
FROM profiles p
LEFT JOIN orders o ON p.id = o.rider_id
WHERE p.role = 'rider'
GROUP BY p.id, p.full_name, p.mobile, p.is_active, p.daily_quota;

-- View for store statistics
CREATE VIEW store_stats AS
SELECT 
  s.*,
  COUNT(p.id) as total_products,
  COUNT(CASE WHEN p.is_available = true THEN 1 END) as available_products,
  COUNT(o.id) as total_orders,
  COALESCE(SUM(o.total_amount), 0) as total_revenue
FROM stores s
LEFT JOIN products p ON s.id = p.store_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE s.is_active = true
GROUP BY s.id;
