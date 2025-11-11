-- Add subscription management tables and columns

-- Add has_subscription flag to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS has_subscription boolean DEFAULT false;

-- Add cancel_cutoff_time to meals table for time-based cancellations
ALTER TABLE meals ADD COLUMN IF NOT EXISTS cancel_cutoff_time time;

-- Create subscription_requests table
CREATE TABLE IF NOT EXISTS subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  meal_types text[] NOT NULL CHECK (array_length(meal_types, 1) > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  active boolean DEFAULT true NOT NULL,
  auto_order boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create subscription_skips table
CREATE TABLE IF NOT EXISTS subscription_skips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  skip_date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(subscription_id, skip_date, meal_type)
);

-- Enable RLS on new tables
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_skips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_requests
CREATE POLICY "Customers can view own subscription requests"
  ON subscription_requests FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create own subscription requests"
  ON subscription_requests FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers can view own subscription requests"
  ON subscription_requests FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can update own subscription requests"
  ON subscription_requests FOR UPDATE
  USING (auth.uid() = provider_id);

-- RLS Policies for subscriptions
CREATE POLICY "Customers can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Providers can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = provider_id);

-- RLS Policies for subscription_skips
CREATE POLICY "Customers can view own subscription skips"
  ON subscription_skips FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create own subscription skips"
  ON subscription_skips FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers can view subscription skips"
  ON subscription_skips FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriptions.id = subscription_skips.subscription_id
    AND subscriptions.provider_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_requests_customer ON subscription_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_provider ON subscription_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON subscription_requests(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON subscriptions(provider_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_subscription_skips_date ON subscription_skips(skip_date);