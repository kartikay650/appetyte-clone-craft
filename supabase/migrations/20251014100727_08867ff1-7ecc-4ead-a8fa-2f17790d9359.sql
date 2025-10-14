-- Remove balance check from place_order_atomic to support credit ledger system
-- This allows orders to be placed even with zero or negative balance

CREATE OR REPLACE FUNCTION public.place_order_atomic(
  p_customer_id uuid,
  p_provider_id uuid,
  p_meal_id uuid,
  p_selected_option text,
  p_delivery_address text,
  p_amount numeric,
  p_notes text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance NUMERIC;
  v_order_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Step 1: Lock customer balance row (ensures atomic operation)
  SELECT current_balance INTO v_current_balance
  FROM customers
  WHERE id = p_customer_id AND provider_id = p_provider_id
  FOR UPDATE;

  -- Validate customer exists
  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  -- Note: Balance check removed to support credit ledger system
  -- Orders are now accepted regardless of current balance

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

  -- Step 3: Deduct balance (can go negative in credit system)
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
$function$;