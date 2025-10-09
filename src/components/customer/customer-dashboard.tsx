import React, { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { dataStore } from "@/lib/data-store"
import { MealCard } from "./meal-card"
import { BalanceCard } from "./balance-card"
import { OrderHistory } from "./order-history"
import { PaymentHistory } from "./payment-history"
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
      // Load today's meals
      setTodaysMeals(dataStore.getTodaysMeals())

      // Load user orders
      setUserOrders(dataStore.getOrdersByUserId(user.id))

      // Load user profile
      setUserProfile(dataStore.getUserById(user.id) || null)

      // Load user payments
      setUserPayments(dataStore.getPaymentsByUserId(user.id))
    }
  }

  const handleOrderPlaced = () => {
    loadUserData()
  }

  const handleBalanceUpdate = () => {
    loadUserData()
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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-balance">Welcome back, {user.name}!</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Order your meals for today</p>
      </div>

      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
          <TabsTrigger value="order" className="text-xs sm:text-sm">
            Order
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">
            History
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm">
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="space-y-4 mt-4">
          <div className="grid gap-3 sm:gap-4">
            {todaysMeals.length > 0 ? (
              todaysMeals.map((meal) => <MealCard key={meal.id} meal={meal} onOrderPlaced={handleOrderPlaced} />)
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-muted-foreground">No meals available for today</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <OrderHistory orders={userOrders} onOrderUpdate={handleOrderPlaced} />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <div className="space-y-4">
            <BalanceCard balance={userProfile.current_balance} onBalanceUpdate={handleBalanceUpdate} />
            <PaymentHistory payments={userPayments} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
