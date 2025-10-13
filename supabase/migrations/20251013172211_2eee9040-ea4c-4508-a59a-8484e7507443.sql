-- Drop the existing SELECT policy that requires auth.uid() match
DROP POLICY IF EXISTS "Providers can view own data" ON providers;

-- Create a new policy that allows authenticated users to view their own provider data
CREATE POLICY "Providers can view own data" 
ON providers 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Also ensure providers can read their data right after signup/login
CREATE POLICY "Allow providers to read own data after auth" 
ON providers 
FOR SELECT 
TO authenticated
USING ((auth.uid())::text = (id)::text);