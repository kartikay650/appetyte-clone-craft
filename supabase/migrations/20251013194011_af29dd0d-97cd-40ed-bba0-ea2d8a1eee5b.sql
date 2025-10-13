-- Create meals table with provider isolation
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  option_1 TEXT NOT NULL,
  option_2 TEXT,
  price NUMERIC(10,2) NOT NULL,
  cut_off_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on meals
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- RLS policies for meals
CREATE POLICY "Providers can view own meals" 
ON public.meals 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create own meals" 
ON public.meals 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own meals" 
ON public.meals 
FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own meals" 
ON public.meals 
FOR DELETE 
USING (auth.uid() = provider_id);

-- Create customers table with provider isolation
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile_number TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  current_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, mobile_number)
);

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS policies for customers
CREATE POLICY "Providers can view own customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create own customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own customers" 
ON public.customers 
FOR DELETE 
USING (auth.uid() = provider_id);

-- Create orders table with provider isolation
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
  amount NUMERIC(10,2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Providers can view own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own orders" 
ON public.orders 
FOR DELETE 
USING (auth.uid() = provider_id);

-- Create payments table with provider isolation
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  razorpay_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Providers can view own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own payments" 
ON public.payments 
FOR UPDATE 
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own payments" 
ON public.payments 
FOR DELETE 
USING (auth.uid() = provider_id);