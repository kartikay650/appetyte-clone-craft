-- Phase 1 & 3: Add delivery settings to providers table
ALTER TABLE public.providers 
ADD COLUMN delivery_settings_json JSONB DEFAULT '{"mode":"custom"}'::jsonb;

-- Phase 1: Add notes column to orders table
ALTER TABLE public.orders 
ADD COLUMN notes TEXT;

-- Phase 3: Create transactions table for financial integrity
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order_debit', 'payment_credit', 'refund_credit')),
  order_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions table
CREATE POLICY "Customers can view own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

-- Create atomic order placement function
CREATE OR REPLACE FUNCTION public.place_order_atomic(
  p_customer_id UUID,
  p_provider_id UUID,
  p_meal_id UUID,
  p_selected_option TEXT,
  p_delivery_address TEXT,
  p_amount NUMERIC,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_order_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Step 1: Check and lock customer balance
  SELECT current_balance INTO v_current_balance
  FROM customers
  WHERE id = p_customer_id AND provider_id = p_provider_id
  FOR UPDATE;

  -- Validate sufficient balance
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Step 2: Create order
  INSERT INTO orders (
    customer_id,
    provider_id,
    meal_id,
    selected_option,
    delivery_address,
    amount,
    notes,
    status,
    timestamp
  ) VALUES (
    p_customer_id,
    p_provider_id,
    p_meal_id,
    p_selected_option,
    p_delivery_address,
    p_amount,
    p_notes,
    'pending',
    now()
  ) RETURNING id INTO v_order_id;

  -- Step 3: Deduct balance
  UPDATE customers
  SET current_balance = current_balance - p_amount
  WHERE id = p_customer_id;

  -- Step 4: Log transaction
  INSERT INTO transactions (
    customer_id,
    provider_id,
    amount,
    type,
    order_id,
    timestamp,
    metadata
  ) VALUES (
    p_customer_id,
    p_provider_id,
    -p_amount,
    'order_debit',
    v_order_id,
    now(),
    jsonb_build_object('meal_id', p_meal_id, 'selected_option', p_selected_option)
  ) RETURNING id INTO v_transaction_id;

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id,
    'transaction_id', v_transaction_id,
    'new_balance', v_current_balance - p_amount
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RAISE EXCEPTION 'Order placement failed: %', SQLERRM;
END;
$$;

-- Add index for better performance
CREATE INDEX idx_transactions_customer ON public.transactions(customer_id, timestamp DESC);
CREATE INDEX idx_transactions_provider ON public.transactions(provider_id, timestamp DESC);
CREATE INDEX idx_transactions_order ON public.transactions(order_id);