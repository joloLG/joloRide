CREATE TYPE user_role AS ENUM ('user', 'rider', 'admin');
CREATE TYPE order_status AS ENUM ('PENDING', 'ASSIGNED', 'DELIVERING', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('COD', 'QRPH');
CREATE TYPE rider_status AS ENUM ('ACTIVE', 'INACTIVE', 'DELIVERING');

-- Profiles table
-- Stores user profiles including riders and admins
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'user',
  full_name text,
  mobile text,
  address text,
  lat numeric,
  lng numeric,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Stores Table
CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_image text,
  is_featured boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read stores"
ON stores FOR SELECT
USING (true);

CREATE POLICY "Admin manage stores"
ON stores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products"
ON products FOR SELECT
USING (true);

CREATE POLICY "Admin manage products"
ON products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  rider_id uuid REFERENCES profiles(id),
  status order_status DEFAULT 'PENDING',
  payment payment_method,
  total numeric,
  drop_lat numeric,
  drop_lng numeric,
  delivery_fee numeric,
  barangay text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Rider view assigned orders"
ON orders FOR SELECT
USING (auth.uid() = rider_id);

CREATE POLICY "Admin view all orders"
ON orders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Order Items Table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity int NOT NULL,
  price numeric NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);


-- Riders Table with FIFO
CREATE TABLE riders (
  id uuid PRIMARY KEY REFERENCES profiles(id),
  status rider_status DEFAULT 'INACTIVE',
  last_assigned timestamptz,
  daily_completed int DEFAULT 0,
  daily_earnings numeric DEFAULT 0
);

ALTER TABLE riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rider view own status"
ON riders FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admin manage riders"
ON riders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);


-- Delivery Fees Table depending on the barangay or area to be delivered to
CREATE TABLE delivery_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay text UNIQUE,
  fee numeric NOT NULL
);

ALTER TABLE delivery_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read fees"
ON delivery_fees FOR SELECT
USING (true);

CREATE POLICY "Admin manage fees"
ON delivery_fees FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Reviews Table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  user_id uuid REFERENCES profiles(id),
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reviews"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "User write review"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- Storage Policy for the items images
CREATE POLICY "Public read product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Admin upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'products'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- FIFO Riders Table Mind
SELECT *
FROM riders
WHERE status = 'ACTIVE'
ORDER BY last_assigned ASC NULLS FIRST
LIMIT 1;

-- Assign rider to order
UPDATE riders
SET last_assigned = now(), status = 'DELIVERING'
WHERE id = :rider_id;
