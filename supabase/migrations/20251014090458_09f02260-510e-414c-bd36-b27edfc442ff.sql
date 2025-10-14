-- Create function to automatically create customer record on signup
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  );
  RETURN NEW;
END;
$$;

-- Create trigger to run on new user creation
CREATE TRIGGER on_auth_user_created_customer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_customer();