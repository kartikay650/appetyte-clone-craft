import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MealManagement } from "./meal-management"
import { OrderManagement } from "./order-management"
import { CustomerManagement } from "./customer-management"
import { ReportsOverview } from "./reports-overview"
import { TimeStatusWidget } from "./time-status-widget"
import { RealTimeNotifications } from "./real-time-notifications"
import { ProviderDeliverySettings } from "./provider-delivery-settings"
import { SubscriptionManagement } from "./subscription-management"
import { DeliveryAddressManagement } from "./delivery-address-management"
import { supabase } from "@/integrations/supabase/client"

interface Meal {
  id: string
  provider_id: string
  date: string
  meal_type: string
  option_1: string
  option_2?: string
  price: number
  cut_off_time: string
  created_at: string
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

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [providerId, setProviderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setIsLoading(false)
      return
    }

    setProviderId(user.id)

    // Fetch meals
    const { data: mealsData } = await (supabase as any)
      .from('meals')
      .select('*')
      .eq('provider_id', user.id)
      .order('date', { ascending: false })
    
    // Fetch customers
    const { data: customersData } = await (supabase as any)
      .from('customers')
      .select('*')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })
    
    // Fetch orders
    const { data: ordersData } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('provider_id', user.id)
      .order('timestamp', { ascending: false })

    setMeals(mealsData || [])
    setCustomers(customersData || [])
    setOrders(ordersData || [])
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your tiffin service business</p>
        </div>
        {providerId && <RealTimeNotifications providerId={providerId} />}
      </div>

      <TimeStatusWidget />

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrderManagement orders={orders} onOrderUpdate={loadData} />
        </TabsContent>

        <TabsContent value="meals">
          <MealManagement meals={meals} onMealUpdate={loadData} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerManagement customers={customers} onCustomerUpdate={loadData} />
        </TabsContent>

        <TabsContent value="subscriptions">
          {providerId && (
            <div className="space-y-6">
              <DeliveryAddressManagement providerId={providerId} />
              <SubscriptionManagement providerId={providerId} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <ReportsOverview orders={orders} customers={customers} meals={meals} />
        </TabsContent>

        <TabsContent value="settings">
          {providerId && <ProviderDeliverySettings providerId={providerId} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
