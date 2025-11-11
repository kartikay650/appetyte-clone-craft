import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";

export interface DeliveryAddress {
  id: string;
  provider_id: string;
  name: string;
  address: string;
  active: boolean;
  created_at: string;
}

interface DeliveryAddressManagementProps {
  providerId: string;
}

export function DeliveryAddressManagement({ providerId }: DeliveryAddressManagementProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", active: true });

  const { data: addresses = [] } = useQuery({
    queryKey: ['delivery-addresses', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DeliveryAddress[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; address: string; active: boolean }) => {
      const { error } = await supabase
        .from('delivery_addresses')
        .insert({
          provider_id: providerId,
          name: data.name,
          address: data.address,
          active: data.active
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-addresses'] });
      toast.success('Delivery address created successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to create delivery address');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryAddress> }) => {
      const { error } = await supabase
        .from('delivery_addresses')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-addresses'] });
      toast.success('Delivery address updated successfully');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to update delivery address');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-addresses'] });
      toast.success('Delivery address deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete delivery address');
    },
  });

  const handleOpenDialog = (address?: DeliveryAddress) => {
    if (address) {
      setEditingAddress(address);
      setFormData({ name: address.name, address: address.address, active: address.active });
    } else {
      setEditingAddress(null);
      setFormData({ name: "", address: "", active: true });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
    setFormData({ name: "", address: "", active: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Addresses
              </CardTitle>
              <CardDescription>
                Manage delivery locations for subscriptions
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No delivery addresses yet. Add your first address to get started.
                  </TableCell>
                </TableRow>
              ) : (
                addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell className="font-medium">{address.name}</TableCell>
                    <TableCell>{address.address}</TableCell>
                    <TableCell>
                      <Badge variant={address.active ? "default" : "secondary"}>
                        {address.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDialog(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this address?')) {
                              deleteMutation.mutate(address.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress ? 'Update the delivery address details' : 'Create a new delivery address for subscriptions'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Office Kitchen, Hostel Mess"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="Complete delivery address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAddress ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
