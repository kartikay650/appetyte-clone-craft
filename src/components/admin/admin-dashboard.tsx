import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your tiffin service business</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="meals">Meals ({meals.length})</TabsTrigger>
          <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <p className="text-center py-8">Order management - Feature coming soon</p>
        </TabsContent>

        <TabsContent value="meals">
          <p className="text-center py-8">Meal management - Feature coming soon</p>
        </TabsContent>

        <TabsContent value="customers">
          <p className="text-center py-8">Customer management - Feature coming soon</p>
        </TabsContent>

        <TabsContent value="reports">
          <p className="text-center py-8">Reports - Feature coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
