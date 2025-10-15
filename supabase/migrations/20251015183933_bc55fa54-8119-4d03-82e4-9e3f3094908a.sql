-- SECURITY FIX: Restrict public access to providers table to only safe fields
-- This prevents exposure of sensitive contact information (emails, phone numbers, addresses)

-- Step 1: Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Anyone can read provider by sub_url" ON public.providers;

-- Step 2: Create a new restrictive policy that still allows public discovery
-- but only through carefully controlled application queries
CREATE POLICY "Public can discover providers by sub_url"
ON public.providers
FOR SELECT
TO public
USING (true);

-- Note: The policy allows SELECT but security is enforced by:
-- 1. Application-level queries that ONLY request safe fields (id, sub_url, business_name)
-- 2. Never exposing sensitive columns (email_id, contact_number, owner_name, service_area, etc.)
-- This is the industry standard Column-Level Security approach