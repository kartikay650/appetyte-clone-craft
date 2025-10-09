import React, { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MealManagement } from "./meal-management"
import { OrderManagement } from "./order-management"
import { CustomerManagement } from "./customer-management"
import { ReportsOverview } from "./reports-overview"
import { TimeStatusWidget } from "./time-status-widget"
import { dataStore } from "@/lib/data-store"
import type { Order, User, Meal } from "@/lib/types"

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<User[]>([])
  const [meals, setMeals] = useState<Meal[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setOrders(dataStore.getOrders())
    setCustomers(dataStore.getUsers().filter((u) => u.role === "customer"))
    setMeals(dataStore.getMeals())
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your tiffin service business</p>
      </div>

      <TimeStatusWidget />

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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

        <TabsContent value="reports">
          <ReportsOverview orders={orders} customers={customers} meals={meals} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
