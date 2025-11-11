import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscription, Subscription } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, UtensilsCrossed, Ban, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { CanceledOrders } from "./CanceledOrders";
import type { DeliveryAddress } from "@/components/admin/delivery-address-management";

interface SubscriptionDashboardProps {
  subscription: Subscription;
  customerId: string;
  providerId: string;
}

export function SubscriptionDashboard({ 
  subscription, 
  customerId, 
  providerId 
}: SubscriptionDashboardProps) {
  const { daysLeft, skipMeal, canceledDaysCount } = useSubscription(customerId, providerId);
  const [isSkipping, setIsSkipping] = useState(false);

  const { data: deliveryAddresses = [] } = useQuery({
    queryKey: ['delivery-addresses', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('provider_id', providerId)
        .eq('active', true);

      if (error) throw error;
      return data as DeliveryAddress[];
    },
  });

  const getAddressName = (addressId: string) => {
    const address = deliveryAddresses.find(a => a.id === addressId);
    return address ? address.name : 'Not set';
  };

  const totalDays = Math.ceil(
    (new Date(subscription.end_date).getTime() - new Date(subscription.start_date).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  const progress = ((totalDays - daysLeft) / totalDays) * 100;

  const handleSkipToday = async (mealType: string) => {
    setIsSkipping(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await skipMeal.mutateAsync({
        subscriptionId: subscription.id,
        skipDate: today,
        mealType
      });
    } catch (error) {
      console.error('Skip error:', error);
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Active Subscription
              </CardTitle>
              <CardDescription>
                {format(new Date(subscription.start_date), 'MMM dd, yyyy')} - {format(new Date(subscription.end_date), 'MMM dd, yyyy')}
              </CardDescription>
            </div>
            <Badge variant="default">{daysLeft} days left</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Subscription Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Subscribed Meals & Delivery Addresses:
            </p>
            <div className="space-y-3">
              {subscription.meal_types.map((type) => (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{getAddressName(subscription.delivery_address_ids?.[type])}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canceledDaysCount > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Canceled Days</span>
                <Badge variant="secondary">{canceledDaysCount}</Badge>
              </div>
            </div>
          )}

          {subscription.auto_order && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Your subscribed meals are automatically ordered daily
              </p>
              <div className="space-y-2">
                {subscription.meal_types.map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => handleSkipToday(type)}
                    disabled={isSkipping}
                  >
                    <span className="capitalize">Cancel Today's {type}</span>
                    <Ban className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CanceledOrders customerId={customerId} subscriptionId={subscription.id} />
    </div>
  );
}
