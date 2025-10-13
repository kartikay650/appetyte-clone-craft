-- Allow authenticated users to insert their own customer record during signup
CREATE POLICY "Customers can insert own record"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);