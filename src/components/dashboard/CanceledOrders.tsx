import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Ban, Undo2 } from "lucide-react";

interface CanceledOrdersProps {
  customerId: string;
  subscriptionId: string;
}

interface SubscriptionSkip {
  id: string;
  subscription_id: string;
  customer_id: string;
  skip_date: string;
  meal_type: string;
  created_at: string;
}

export function CanceledOrders({ customerId, subscriptionId }: CanceledOrdersProps) {
  const queryClient = useQueryClient();

  const { data: canceledOrders = [] } = useQuery({
    queryKey: ['subscription-skips', subscriptionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_skips')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('customer_id', customerId)
        .order('skip_date', { ascending: false });

      if (error) throw error;
      return data as SubscriptionSkip[];
    },
  });

  const undoCancelMutation = useMutation({
    mutationFn: async (skipId: string) => {
      const { error } = await supabase
        .from('subscription_skips')
        .delete()
        .eq('id', skipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-skips'] });
      toast.success('Meal order restored successfully');
    },
    onError: () => {
      toast.error('Failed to restore meal order');
    },
  });

  const handleUndoCancel = (skipId: string) => {
    if (confirm('Are you sure you want to restore this meal order?')) {
      undoCancelMutation.mutate(skipId);
    }
  };

  if (canceledOrders.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Canceled Orders
        </CardTitle>
        <CardDescription>
          View and manage your canceled subscription meals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Meal Type</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canceledOrders.map((skip) => (
              <TableRow key={skip.id}>
                <TableCell>{format(new Date(skip.skip_date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {skip.meal_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUndoCancel(skip.id)}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Undo
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
