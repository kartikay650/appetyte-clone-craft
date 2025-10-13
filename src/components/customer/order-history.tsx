import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils/time"

interface Order {
  id: string
  customer_id: string
  meal_id: string
  selected_option: string
  delivery_address: string
  status: string
  amount: number
  timestamp: string
}

interface OrderHistoryProps {
  orders: Order[]
  onOrderUpdate?: () => void
}

export function OrderHistory({ orders }: OrderHistoryProps) {
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
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">No orders yet</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Your order history will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold">Order History</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {sortedOrders.map((order) => {
        return (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base capitalize truncate">
                    Order
                  </CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.timestamp.split("T")[0])}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <IndianRupee className="h-3 w-3" />
                      {order.amount}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(order.status)} text-xs`}>{order.status.replace("_", " ")}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm">
                <strong>Ordered:</strong> {order.selected_option}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Order ID: {order.id}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
