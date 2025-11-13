-- Create function to increment customer balance (for refunds)
CREATE OR REPLACE FUNCTION public.increment_balance(customer_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE customers
  SET current_balance = current_balance + amount
  WHERE id = customer_id;
END;
$$;