import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  customer_id: string;
  provider_id: string;
  meal_types: string[];
  start_date: string;
  end_date: string;
  active: boolean;
  auto_order: boolean;
  created_at: string;
}

export interface SubscriptionRequest {
  id: string;
  customer_id: string;
  provider_id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function useSubscription(customerId: string, providerId: string) {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', customerId, providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('provider_id', providerId)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
  });

  const { data: request, isLoading: requestLoading } = useQuery({
    queryKey: ['subscription-request', customerId, providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_requests')
        .select('*')
        .eq('customer_id', customerId)
        .eq('provider_id', providerId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) throw error;
      return data as SubscriptionRequest | null;
    },
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('subscription_requests')
        .insert({
          customer_id: customerId,
          provider_id: providerId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-request', customerId, providerId] });
      toast.success('Subscription request submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit subscription request');
      console.error(error);
    },
  });

  const skipMeal = useMutation({
    mutationFn: async ({ subscriptionId, skipDate, mealType }: { 
      subscriptionId: string; 
      skipDate: string; 
      mealType: string;
    }) => {
      const { data, error } = await supabase
        .from('subscription_skips')
        .insert({
          subscription_id: subscriptionId,
          customer_id: customerId,
          skip_date: skipDate,
          meal_type: mealType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Meal cancelled for today');
    },
    onError: (error) => {
      toast.error('Failed to cancel meal');
      console.error(error);
    },
  });

  const getDaysLeft = () => {
    if (!subscription) return 0;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return {
    subscription,
    request,
    isLoading: subscriptionLoading || requestLoading,
    createRequest,
    skipMeal,
    daysLeft: getDaysLeft(),
    status: subscription ? 'active' : request ? 'pending' : 'none'
  };
}
