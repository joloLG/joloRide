-- Fix RLS policy for rider order confirmation
-- This allows riders to assign orders to themselves (confirm action)

-- Drop existing rider policies on orders
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Riders can update assigned orders" ON orders;

-- Create updated policies for orders table
-- Riders can view orders assigned to them
CREATE POLICY "Riders can view assigned orders" ON orders
  FOR SELECT USING (
    rider_id = auth.uid()
  );

-- Riders can update orders assigned to them OR assign unassigned orders to themselves
CREATE POLICY "Riders can update assigned orders" ON orders
  FOR UPDATE USING (
    rider_id = auth.uid() OR 
    (rider_id IS NULL AND auth.uid() IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() AND role = 'rider' AND is_active = true
    ))
  );

-- Also ensure riders can insert into order_status_history when they confirm orders
DROP POLICY IF EXISTS "Riders can insert order status history" ON order_status_history;

CREATE POLICY "Riders can insert order status history" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_status_history.order_id 
      AND (
        o.rider_id = auth.uid() OR
        (o.rider_id IS NULL AND auth.uid() IN (
          SELECT id FROM profiles 
          WHERE user_id = auth.uid() AND role = 'rider' AND is_active = true
        ))
      )
    )
  );

-- Grant permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_status_history TO authenticated;
