import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndianRupee, Clock, User, MapPin } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils/time"
import { CanceledOrdersView } from "@/components/dashboard/CanceledOrdersView"

interface Order {
  id: string
  provider_id: string
  customer_id: string
  meal_id: string
  selected_option: string
  delivery_address: string
  status: string
  amount: number
  timestamp: string
  customer_name?: string
}

interface OrderManagementProps {
  orders: Order[]
  onOrderUpdate: () => void
}

export function OrderManagement({ orders, onOrderUpdate }: OrderManagementProps) {
  const [providerId, setProviderId] = useState<string | null>(null)
  
  // Get provider ID on mount
  React.useEffect(() => {
    const getProviderId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setProviderId(user.id)
    }
    getProviderId()
  }, [])
  const { toast } = useToast()
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await (supabase as any)
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Order updated",
      description: `Order status changed to ${newStatus.replace("_", " ")}`,
    })
    onOrderUpdate()
  }

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return order.status !== "canceled"
    return order.status === filterStatus
  })

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const todaysOrders = orders.filter((order) => {
    const orderDate = order.timestamp.split("T")[0]
    const today = new Date().toISOString().split("T")[0]
    return orderDate === today
  })

  return (
    <Tabs defaultValue="active" className="space-y-6">
      <TabsList>
        <TabsTrigger value="active">Active Orders</TabsTrigger>
        <TabsTrigger value="canceled">Canceled Orders</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {todaysOrders.reduce((sum, order) => sum + order.amount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Orders</h3>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {sortedOrders.map((order) => {
          return (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {order.customer_name ?? `Order #${order.id.slice(0, 8)}`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.timestamp.split("T")[0])}
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {order.amount}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm">
                    <strong>Option:</strong> {order.selected_option}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <strong>Delivery to:</strong> {order.delivery_address}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Order ID: {order.id}</p>
                </div>

                {order.status !== "delivered" && (
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "confirmed")}>
                        Confirm Order
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "out_for_delivery")}>
                        Mark Out for Delivery
                      </Button>
                    )}
                    {order.status === "out_for_delivery" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivered")}>
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {sortedOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        )}
      </div>
      </TabsContent>

      <TabsContent value="canceled">
        {providerId && <CanceledOrdersView providerId={providerId} />}
      </TabsContent>
    </Tabs>
  )
}
