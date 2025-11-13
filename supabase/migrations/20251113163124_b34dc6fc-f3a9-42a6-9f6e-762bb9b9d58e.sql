-- Add canceled_at column to orders table if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS canceled_at timestamp with time zone;

-- Update status check constraint to include 'canceled'
-- First drop the old constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_status_check;
  END IF;
END $$;

-- Add new constraint with canceled status
ALTER TABLE orders
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'canceled'));