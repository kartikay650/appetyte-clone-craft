-- Make address column nullable in customers table
ALTER TABLE public.customers 
ALTER COLUMN address DROP NOT NULL;

-- Set default value for any existing NULL addresses
UPDATE public.customers 
SET address = 'Address to be provided' 
WHERE address IS NULL OR address = '';