import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts"
import { DollarSign, ShoppingCart, TrendingUp, Users, Award } from "lucide-react"

interface OtherReportsProps {
  providerId: string
}

interface MealTypeData {
  meal_type: string
  order_count: number
  total_revenue: number
}

interface PopularItem {
  item_name: string
  order_count: number
}

export function OtherReports({ providerId }: OtherReportsProps) {
  const [todaysRevenue, setTodaysRevenue] = useState(0)
  const [todaysOrders, setTodaysOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [activeCustomers, setActiveCustomers] = useState({ active: 0, total: 0 })
  const [avgOrderValue, setAvgOrderValue] = useState(0)
  const [mealTypeData, setMealTypeData] = useState<MealTypeData[]>([])
  const [popularItems, setPopularItems] = useState<{ most: PopularItem | null, least: PopularItem | null }>({ most: null, least: null })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchReportsData()
  }, [providerId])

  const fetchReportsData = async () => {
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      // Fetch today's orders
      const { data: todayOrders, error: todayError } = await supabase
        .from("orders")
        .select("amount")
        .eq("provider_id", providerId)
        .gte("timestamp", `${today}T00:00:00`)
        .lte("timestamp", `${today}T23:59:59`)
        .neq("status", "canceled")

      if (todayError) throw todayError

      const todayRevenue = todayOrders?.reduce((sum, order) => sum + Number(order.amount), 0) || 0
      setTodaysRevenue(todayRevenue)
      setTodaysOrders(todayOrders?.length || 0)

      // Fetch all orders
      const { data: allOrders, error: allError } = await supabase
        .from("orders")
        .select("amount")
        .eq("provider_id", providerId)
        .neq("status", "canceled")

      if (allError) throw allError

      const totalRev = allOrders?.reduce((sum, order) => sum + Number(order.amount), 0) || 0
      setTotalRevenue(totalRev)
      setTotalOrders(allOrders?.length || 0)
      setAvgOrderValue(allOrders?.length ? totalRev / allOrders.length : 0)

      // Fetch customer stats
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("id, created_at")
        .eq("provider_id", providerId)

      if (customersError) throw customersError

      const { data: activeCustomersData, error: activeError } = await supabase
        .from("orders")
        .select("customer_id")
        .eq("provider_id", providerId)
        .neq("status", "canceled")

      if (activeError) throw activeError

      const uniqueActiveCustomers = new Set(activeCustomersData?.map(o => o.customer_id) || [])
      setActiveCustomers({ active: uniqueActiveCustomers.size, total: customers?.length || 0 })

      // Fetch meal type performance
      const { data: mealOrders, error: mealError } = await supabase
        .from("orders")
        .select("amount, meals!inner(meal_type)")
        .eq("provider_id", providerId)
        .neq("status", "canceled")

      if (mealError) throw mealError

      const mealTypeMap = new Map<string, { count: number, revenue: number }>()
      mealOrders?.forEach((order: any) => {
        const mealType = order.meals?.meal_type || "unknown"
        const current = mealTypeMap.get(mealType) || { count: 0, revenue: 0 }
        mealTypeMap.set(mealType, {
          count: current.count + 1,
          revenue: current.revenue + Number(order.amount)
        })
      })

      const mealData: MealTypeData[] = Array.from(mealTypeMap.entries()).map(([meal_type, data]) => ({
        meal_type: meal_type.charAt(0).toUpperCase() + meal_type.slice(1),
        order_count: data.count,
        total_revenue: data.revenue
      }))

      setMealTypeData(mealData)

      // Fetch popular items
      const { data: itemOrders, error: itemError } = await supabase
        .from("orders")
        .select("selected_option")
        .eq("provider_id", providerId)
        .neq("status", "canceled")

      if (itemError) throw itemError

      const itemMap = new Map<string, number>()
      itemOrders?.forEach(order => {
        const item = order.selected_option
        itemMap.set(item, (itemMap.get(item) || 0) + 1)
      })

      const sortedItems = Array.from(itemMap.entries())
        .map(([item_name, order_count]) => ({ item_name, order_count }))
        .sort((a, b) => b.order_count - a.order_count)

      setPopularItems({
        most: sortedItems[0] || null,
        least: sortedItems[sortedItems.length - 1] || null
      })

    } catch (error) {
      console.error("Error fetching reports data:", error)
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todaysRevenue)}</div>
            <p className="text-xs text-muted-foreground">{todaysOrders} orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">{totalOrders} total orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysOrders}</div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCustomers.active}/{activeCustomers.total}
            </div>
            <p className="text-xs text-muted-foreground">Have placed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Meal Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Type Performance</CardTitle>
            <CardDescription>Orders and revenue by meal type</CardDescription>
          </CardHeader>
          <CardContent>
            {mealTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mealTypeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="meal_type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'total_revenue') return [formatCurrency(value), 'Revenue']
                      return [value, 'Orders']
                    }}
                  />
                  <Legend />
                  <Bar dataKey="order_count" fill="hsl(var(--primary))" name="Orders" />
                  <Bar dataKey="total_revenue" fill="hsl(var(--secondary))" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
            <CardDescription>Most and least ordered items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {popularItems.most ? (
              <>
                <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <span className="text-2xl">🥇</span>
                      Most Popular
                    </p>
                    <p className="text-lg font-semibold">{popularItems.most.item_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {popularItems.most.order_count} orders
                    </p>
                  </div>
                </div>
                {popularItems.least && popularItems.least.item_name !== popularItems.most.item_name && (
                  <div className="flex items-start justify-between p-4 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <span className="text-2xl">🥈</span>
                        Least Popular
                      </p>
                      <p className="text-lg font-semibold">{popularItems.least.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {popularItems.least.order_count} orders
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No items data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meal Distribution Pie Chart */}
      {mealTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Meal Type Distribution</CardTitle>
            <CardDescription>Order distribution across meal types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mealTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ meal_type, order_count }) => `${meal_type}: ${order_count}`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="order_count"
                >
                  {mealTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
