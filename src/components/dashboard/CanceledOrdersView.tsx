import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { formatDate } from "@/lib/utils/time"
import { XCircle, User, Phone, Calendar, Clock } from "lucide-react"

interface CanceledOrder {
  id: string
  customer_name: string
  customer_contact: string
  meal_type: string
  meal_date: string
  selected_option: string
  amount: number
  canceled_at: string
  delivery_address: string
}

interface CanceledOrdersViewProps {
  providerId: string
}

export function CanceledOrdersView({ providerId }: CanceledOrdersViewProps) {
  const [canceledOrders, setCanceledOrders] = useState<CanceledOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCanceledOrders()
  }, [providerId])

  const fetchCanceledOrders = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          selected_option,
          amount,
          canceled_at,
          delivery_address,
          customers!inner(name, mobile_number),
          meals!inner(date, meal_type)
        `)
        .eq("provider_id", providerId)
        .eq("status", "canceled")
        .order("canceled_at", { ascending: false })

      if (error) throw error

      const formattedData = (data || []).map((order: any) => ({
        id: order.id,
        customer_name: order.customers.name,
        customer_contact: order.customers.mobile_number,
        meal_type: order.meals.meal_type,
        meal_date: order.meals.date,
        selected_option: order.selected_option,
        amount: order.amount,
        canceled_at: order.canceled_at,
        delivery_address: order.delivery_address
      }))

      setCanceledOrders(formattedData)
    } catch (error) {
      console.error("Error fetching canceled orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "lunch":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "dinner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <CardTitle>Canceled Orders</CardTitle>
        </div>
        <CardDescription>
          Track all canceled meal orders and refunds
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading canceled orders...</div>
        ) : canceledOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No canceled orders found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Canceled At</TableHead>
                  <TableHead className="text-right">Refund</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {canceledOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{order.customer_contact}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getMealTypeColor(order.meal_type)}>
                          {order.meal_type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.meal_date)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{order.selected_option}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.delivery_address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {new Date(order.canceled_at).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                          timeZone: 'Asia/Kolkata'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ₹{order.amount.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
