import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { dataStore } from "@/lib/data-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Meal, Order, User, Payment } from "@/lib/types"

export function CustomerDashboard() {
  const { user } = useAuth()
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([])
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [userPayments, setUserPayments] = useState<Payment[]>([])

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = () => {
    if (user) {
      setTodaysMeals(dataStore.getTodaysMeals())
      setUserOrders(dataStore.getOrdersByUserId(user.id))
      setUserProfile(dataStore.getUserById(user.id) || null)
      setUserPayments(dataStore.getPaymentsByUserId(user.id))
    }
  }

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Order your meals and manage your account</p>
      </div>

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meals">Today's Meals</TabsTrigger>
          <TabsTrigger value="orders">Orders ({userOrders.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="meals">
          <p className="text-center py-8">Meals for today ({todaysMeals.length} available)</p>
        </TabsContent>

        <TabsContent value="orders">
          <p className="text-center py-8">Your order history</p>
        </TabsContent>

        <TabsContent value="payments">
          <p className="text-center py-8">Payment history - Balance: ₹{userProfile.current_balance}</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
