-- Backfill missing customer records for existing auth users
INSERT INTO public.customers (
  id,
  name,
  email,
  mobile_number,
  address,
  provider_id,
  current_balance
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', ''),
  au.email,
  COALESCE(au.raw_user_meta_data->>'mobile_number', ''),
  NULL,
  (au.raw_user_meta_data->>'provider_id')::uuid,
  0
FROM auth.users au
LEFT JOIN public.customers c ON c.id = au.id
WHERE c.id IS NULL
  AND au.raw_user_meta_data->>'provider_id' IS NOT NULL;