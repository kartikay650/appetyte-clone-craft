-- Add email column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email TEXT;

-- Update customers table to make email unique per provider
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_provider_idx ON public.customers(email, provider_id);

-- Enable Realtime for meals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.meals;

-- RLS Policies for customers to read their own data
CREATE POLICY "Customers can view own profile" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policy for customers to read meals from their provider
CREATE POLICY "Customers can view provider meals" 
ON public.meals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = auth.uid() 
    AND customers.provider_id = meals.provider_id
  )
);

-- RLS Policy for customers to create their own orders
CREATE POLICY "Customers can create own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = auth.uid() 
    AND customers.id = orders.customer_id
  )
);

-- RLS Policy for customers to view their own orders
CREATE POLICY "Customers can view own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = customer_id);

-- RLS Policy for customers to view their own payments
CREATE POLICY "Customers can view own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = customer_id);