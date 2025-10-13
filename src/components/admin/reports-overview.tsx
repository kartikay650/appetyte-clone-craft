import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, TrendingUp, Users, ShoppingBag } from "lucide-react"

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
}

interface Customer {
  id: string
  provider_id: string
  mobile_number: string
  name: string
  address: string
  current_balance: number
  created_at: string
}

interface Meal {
  id: string
  provider_id: string
  date: string
  meal_type: string
  option_1: string
  option_2?: string | null
  price: number
  cut_off_time: string
  created_at: string
}

interface ReportsOverviewProps {
  orders: Order[]
  customers: Customer[]
  meals: Meal[]
}

export function ReportsOverview({ orders, customers, meals }: ReportsOverviewProps) {
  // Calculate today's metrics
  const today = new Date().toISOString().split("T")[0]
  const todaysOrders = orders.filter((order) => order.timestamp.split("T")[0] === today)

  // Revenue calculations
  const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.amount, 0)
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)

  // Meal type analysis
  const mealTypeStats = orders.reduce(
    (stats, order) => {
      const meal = meals.find((m) => m.id === order.meal_id)
      if (meal) {
        stats[meal.meal_type] = (stats[meal.meal_type] || 0) + 1
      }
      return stats
    },
    {} as Record<string, number>,
  )

  // Popular meal options
  const mealOptionStats = orders.reduce(
    (stats, order) => {
      stats[order.selected_option] = (stats[order.selected_option] || 0) + 1
      return stats
    },
    {} as Record<string, number>,
  )

  const mostPopularOption = Object.entries(mealOptionStats).sort(([, a], [, b]) => b - a)[0]
  const leastPopularOption = Object.entries(mealOptionStats).sort(([, a], [, b]) => a - b)[0]

  // Average order value
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  // Customer analysis
  const activeCustomers = customers.filter((customer) => {
    return orders.some((order) => order.customer_id === customer.id)
  }).length

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Business Reports</h3>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todaysRevenue}</div>
            <p className="text-xs text-muted-foreground">{todaysOrders.length} orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue}</div>
            <p className="text-xs text-muted-foreground">{orders.length} total orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">out of {customers.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meal Type Performance</CardTitle>
            <CardDescription>Orders by meal type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(mealTypeStats).map(([mealType, count]) => (
              <div key={mealType} className="flex items-center justify-between">
                <span className="capitalize">{mealType}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{count} orders</span>
                  <span className="text-sm text-muted-foreground">
                    ₹
                    {orders
                      .filter((o) => {
                        const meal = meals.find((m) => m.id === o.meal_id)
                        return meal?.meal_type === mealType
                      })
                      .reduce((sum, o) => sum + o.amount, 0)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
            <CardDescription>Most and least ordered items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mostPopularOption && (
              <div>
                <p className="text-sm font-medium text-green-600">Most Popular</p>
                <p className="text-lg">{mostPopularOption[0]}</p>
                <p className="text-sm text-muted-foreground">{mostPopularOption[1]} orders</p>
              </div>
            )}
            {leastPopularOption && mostPopularOption?.[0] !== leastPopularOption?.[0] && (
              <div>
                <p className="text-sm font-medium text-orange-600">Least Popular</p>
                <p className="text-lg">{leastPopularOption[0]}</p>
                <p className="text-sm text-muted-foreground">{leastPopularOption[1]} orders</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
