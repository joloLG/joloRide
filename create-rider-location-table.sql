-- Create Rider Location History Table
-- Run this in Supabase SQL Editor

-- Create table for storing rider location history
CREATE TABLE IF NOT EXISTS rider_location_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rider_location_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rider_location_history
-- Riders can manage their own location history
CREATE POLICY "Riders can manage own location history" ON rider_location_history
  FOR ALL USING (
    rider_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'rider'
    )
  );

-- Users can view location history for their orders
CREATE POLICY "Users can view own order location history" ON rider_location_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN profiles p ON p.id = o.user_id
      WHERE o.id = rider_location_history.order_id 
      AND p.user_id = auth.uid()
    )
  );

-- Admins can view all location history
CREATE POLICY "Admins can view all location history" ON rider_location_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rider_location_history_rider_id ON rider_location_history(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_location_history_order_id ON rider_location_history(order_id);
CREATE INDEX IF NOT EXISTS idx_rider_location_history_timestamp ON rider_location_history(timestamp);

-- Add lat/lng columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8);
