-- Create delivery_addresses table for admin-managed delivery locations
CREATE TABLE public.delivery_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_addresses
CREATE POLICY "Providers can view own delivery addresses"
  ON public.delivery_addresses
  FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create own delivery addresses"
  ON public.delivery_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own delivery addresses"
  ON public.delivery_addresses
  FOR UPDATE
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own delivery addresses"
  ON public.delivery_addresses
  FOR DELETE
  USING (auth.uid() = provider_id);

-- Customers can view delivery addresses for their provider
CREATE POLICY "Customers can view provider delivery addresses"
  ON public.delivery_addresses
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = auth.uid() 
    AND customers.provider_id = delivery_addresses.provider_id
  ));

-- Add delivery_address_ids to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN delivery_address_ids JSONB DEFAULT '{}'::jsonb;

-- Create index for performance
CREATE INDEX idx_delivery_addresses_provider ON public.delivery_addresses(provider_id) WHERE active = true;
CREATE INDEX idx_subscriptions_delivery_addresses ON public.subscriptions USING gin(delivery_address_ids);