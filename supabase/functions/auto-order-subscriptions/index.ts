import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subscription {
  id: string;
  customer_id: string;
  provider_id: string;
  meal_types: string[];
  delivery_address_ids: Record<string, string>;
  active: boolean;
  auto_order: boolean;
}

interface Meal {
  id: string;
  provider_id: string;
  date: string;
  meal_type: string;
  price: number;
  option_1: string;
  option_2?: string;
}

interface SubscriptionSkip {
  subscription_id: string;
  customer_id: string;
  skip_date: string;
  meal_type: string;
}

interface DeliveryAddress {
  id: string;
  address: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date in YYYY-MM-DD format (IST timezone)
    const today = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(today.getTime() + istOffset);
    const currentDate = istDate.toISOString().split('T')[0];

    console.log(`Running auto-order for date: ${currentDate}`);

    // Fetch all active subscriptions with auto_order enabled
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('active', true)
      .eq('auto_order', true)
      .lte('start_date', currentDate)
      .gte('end_date', currentDate);

    if (subsError) {
      throw new Error(`Failed to fetch subscriptions: ${subsError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscriptions found', ordersCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all subscription skips for today
    const { data: skips, error: skipsError } = await supabase
      .from('subscription_skips')
      .select('*')
      .eq('skip_date', currentDate);

    if (skipsError) {
      throw new Error(`Failed to fetch subscription skips: ${skipsError.message}`);
    }

    const skipMap = new Map<string, Set<string>>();
    (skips || []).forEach((skip: SubscriptionSkip) => {
      if (!skipMap.has(skip.subscription_id)) {
        skipMap.set(skip.subscription_id, new Set());
      }
      skipMap.get(skip.subscription_id)!.add(skip.meal_type);
    });

    // Fetch today's meals
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('date', currentDate);

    if (mealsError) {
      throw new Error(`Failed to fetch meals: ${mealsError.message}`);
    }

    // Group meals by provider and meal type
    const mealMap = new Map<string, Map<string, Meal>>();
    (meals || []).forEach((meal: Meal) => {
      if (!mealMap.has(meal.provider_id)) {
        mealMap.set(meal.provider_id, new Map());
      }
      mealMap.get(meal.provider_id)!.set(meal.meal_type, meal);
    });

    // Fetch all delivery addresses
    const { data: addresses, error: addressError } = await supabase
      .from('delivery_addresses')
      .select('id, address');

    if (addressError) {
      throw new Error(`Failed to fetch delivery addresses: ${addressError.message}`);
    }

    const addressMap = new Map<string, string>();
    (addresses || []).forEach((addr: DeliveryAddress) => {
      addressMap.set(addr.id, addr.address);
    });

    // Process each subscription
    let ordersCreated = 0;
    const errors: string[] = [];

    for (const subscription of subscriptions as Subscription[]) {
      const skippedMeals = skipMap.get(subscription.id) || new Set();
      const providerMeals = mealMap.get(subscription.provider_id);

      if (!providerMeals) {
        console.log(`No meals found for provider ${subscription.provider_id} on ${currentDate}`);
        continue;
      }

      for (const mealType of subscription.meal_types) {
        // Check if meal is skipped
        if (skippedMeals.has(mealType)) {
          console.log(`Skipping ${mealType} for subscription ${subscription.id}`);
          continue;
        }

        // Check if meal exists for this type
        const meal = providerMeals.get(mealType);
        if (!meal) {
          console.log(`No ${mealType} meal found for provider ${subscription.provider_id} on ${currentDate}`);
          continue;
        }

        // Get delivery address
        const addressId = subscription.delivery_address_ids?.[mealType];
        const deliveryAddress = addressId ? addressMap.get(addressId) : null;

        if (!deliveryAddress) {
          errors.push(`No delivery address for ${mealType} in subscription ${subscription.id}`);
          continue;
        }

        // Create order using the atomic function
        const { error: orderError } = await supabase.rpc('place_order_atomic', {
          p_customer_id: subscription.customer_id,
          p_provider_id: subscription.provider_id,
          p_meal_id: meal.id,
          p_selected_option: meal.option_1, // Default to option 1 for auto-orders
          p_delivery_address: deliveryAddress,
          p_amount: meal.price,
          p_notes: `Auto-order from subscription`
        });

        if (orderError) {
          errors.push(`Failed to create order for subscription ${subscription.id}, meal ${mealType}: ${orderError.message}`);
        } else {
          ordersCreated++;
          console.log(`Created auto-order for subscription ${subscription.id}, meal type ${mealType}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto-order processing completed',
        date: currentDate,
        ordersCreated,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Auto-order function error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
