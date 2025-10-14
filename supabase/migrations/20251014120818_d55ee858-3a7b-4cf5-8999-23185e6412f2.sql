-- Create trigger to automatically create customer records when users sign up
-- This ensures every authenticated user gets a corresponding customer record

CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create customer record if provider_id is present in metadata
  IF NEW.raw_user_meta_data->>'provider_id' IS NOT NULL THEN
    INSERT INTO public.customers (
      id,
      name,
      email,
      mobile_number,
      address,
      provider_id,
      current_balance
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
      NULL,
      (NEW.raw_user_meta_data->>'provider_id')::uuid,
      0
    )
    ON CONFLICT (id) DO NOTHING;  -- Prevent errors if customer already exists
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users to automatically create customer records
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_customer();

-- Also create a function to backfill missing customer records for existing users
CREATE OR REPLACE FUNCTION public.ensure_customer_record(p_user_id uuid, p_provider_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_email text;
  v_user_name text;
  v_user_mobile text;
BEGIN
  -- Get user details from auth.users
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
  
  -- Create customer record if it doesn't exist
  INSERT INTO public.customers (
    id,
    name,
    email,
    mobile_number,
    address,
    provider_id,
    current_balance
  ) VALUES (
    p_user_id,
    COALESCE(v_user_name, ''),
    COALESCE(v_user_email, ''),
    COALESCE(v_user_mobile, ''),
    NULL,
    p_provider_id,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    provider_id = p_provider_id
  WHERE customers.provider_id IS NULL OR customers.provider_id != p_provider_id;
END;
$$;