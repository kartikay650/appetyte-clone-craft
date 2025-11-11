import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Eye, CalendarCheck, CalendarX, UserCheck } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface SubscriptionRequest {
  id: string;
  customer_id: string;
  provider_id: string;
  created_at: string;
  status: string;
  customers: Customer;
}

interface Subscription {
  id: string;
  customer_id: string;
  meal_types: string[];
  start_date: string;
  end_date: string;
  active: boolean;
  auto_order: boolean;
  customers: Customer;
}

export function SubscriptionManagement({ providerId }: { providerId: string }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request?: SubscriptionRequest }>({ open: false });
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; subscription?: Subscription }>({ open: false });
  
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch pending requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['subscription-requests', providerId, 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_requests')
        .select('*, customers(id, name, email)')
        .eq('provider_id', providerId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SubscriptionRequest[];
    },
  });

  // Fetch active subscriptions
  const { data: activeSubscriptions = [] } = useQuery({
    queryKey: ['subscriptions', providerId, 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, customers(id, name, email)')
        .eq('provider_id', providerId)
        .eq('active', true)
        .order('end_date', { ascending: true });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  // Fetch expired subscriptions
  const { data: expiredSubscriptions = [] } = useQuery({
    queryKey: ['subscriptions', providerId, 'expired'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, customers(id, name, email)')
        .eq('provider_id', providerId)
        .lt('end_date', today)
        .order('end_date', { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, customerId }: { requestId: string; customerId: string }) => {
      // Create subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          customer_id: customerId,
          provider_id: providerId,
          meal_types: selectedMealTypes,
          start_date: startDate,
          end_date: endDate,
          active: true,
          auto_order: true
        });

      if (subError) throw subError;

      // Update request status
      const { error: reqError } = await supabase
        .from('subscription_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (reqError) throw reqError;

      // Update customer has_subscription flag
      const { error: custError } = await supabase
        .from('customers')
        .update({ has_subscription: true })
        .eq('id', customerId);

      if (custError) throw custError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-requests'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription approved successfully');
      setReviewDialog({ open: false });
      setSelectedMealTypes([]);
      setStartDate("");
      setEndDate("");
    },
    onError: (error) => {
      toast.error('Failed to approve subscription');
      console.error(error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('subscription_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-requests'] });
      toast.success('Subscription request rejected');
      setReviewDialog({ open: false });
    },
    onError: (error) => {
      toast.error('Failed to reject subscription');
      console.error(error);
    },
  });

  const renewMutation = useMutation({
    mutationFn: async ({ subscriptionId, newEndDate }: { subscriptionId: string; newEndDate: string }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ end_date: newEndDate, active: true })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription renewed successfully');
    },
    onError: (error) => {
      toast.error('Failed to renew subscription');
      console.error(error);
    },
  });

  const handleApprove = () => {
    if (!reviewDialog.request) return;
    if (selectedMealTypes.length === 0) {
      toast.error('Please select at least one meal type');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    approveMutation.mutate({
      requestId: reviewDialog.request.id,
      customerId: reviewDialog.request.customer_id
    });
  };

  const handleReject = () => {
    if (!reviewDialog.request) return;
    rejectMutation.mutate(reviewDialog.request.id);
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filteredActive = activeSubscriptions.filter(sub =>
    sub.customers.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Manage customer subscription requests and active memberships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending Approvals ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeSubscriptions.length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired ({expiredSubscriptions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No pending requests
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.customers.name}</TableCell>
                        <TableCell>{request.customers.email}</TableCell>
                        <TableCell>{format(new Date(request.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setReviewDialog({ open: true, request })}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Meal Types</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActive.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No active subscriptions
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActive.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.customers.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {sub.meal_types.map(type => (
                              <Badge key={type} variant="outline" className="capitalize text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getDaysLeft(sub.end_date)} days</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(sub.start_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(sub.end_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDetailsDialog({ open: true, subscription: sub })}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Ended On</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No expired subscriptions
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiredSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.customers.name}</TableCell>
                        <TableCell>
                          {format(new Date(sub.start_date), 'MMM dd, yyyy')} - {format(new Date(sub.end_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{format(new Date(sub.end_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newEndDate = prompt('Enter new end date (YYYY-MM-DD):');
                              if (newEndDate) {
                                renewMutation.mutate({ subscriptionId: sub.id, newEndDate });
                              }
                            }}
                          >
                            <CalendarCheck className="h-4 w-4 mr-2" />
                            Renew
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Subscription Request</DialogTitle>
            <DialogDescription>
              {reviewDialog.request && `From ${reviewDialog.request.customers.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Meal Types</Label>
              <div className="space-y-2">
                {['breakfast', 'lunch', 'dinner'].map((meal) => (
                  <div key={meal} className="flex items-center space-x-2">
                    <Checkbox
                      id={meal}
                      checked={selectedMealTypes.includes(meal)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMealTypes([...selectedMealTypes, meal]);
                        } else {
                          setSelectedMealTypes(selectedMealTypes.filter(m => m !== meal));
                        }
                      }}
                    />
                    <Label htmlFor={meal} className="capitalize cursor-pointer">
                      {meal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReject}>
              <CalendarX className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApprove}>
              <CalendarCheck className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              {detailsDialog.subscription && detailsDialog.subscription.customers.name}
            </DialogDescription>
          </DialogHeader>
          
          {detailsDialog.subscription && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{detailsDialog.subscription.customers.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Meal Types</Label>
                <div className="flex gap-2 mt-1">
                  {detailsDialog.subscription.meal_types.map(type => (
                    <Badge key={type} className="capitalize">{type}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Duration</Label>
                <p className="font-medium">
                  {format(new Date(detailsDialog.subscription.start_date), 'MMM dd, yyyy')} - {format(new Date(detailsDialog.subscription.end_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Days Remaining</Label>
                <p className="font-medium">{getDaysLeft(detailsDialog.subscription.end_date)} days</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Auto-Order</Label>
                <p className="font-medium">{detailsDialog.subscription.auto_order ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
