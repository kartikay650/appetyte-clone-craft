import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MealCard } from "./meal-card"
import { OrderHistory } from "./order-history"
import { BalanceCard } from "./balance-card"
import { PaymentHistory } from "./payment-history"
import { CustomerHeader } from "./CustomerHeader"
import { supabase } from "@/integrations/supabase/client"

interface Payment {
  id: string
  customer_id: string
  provider_id: string
  amount: number
  razorpay_transaction_id?: string
  status: "pending" | "paid" | "failed"
  timestamp: string
}

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

interface Order {
  id: string
  customer_id: string
  provider_id: string
  meal_id: string
  selected_option: string
  delivery_address: string
  status: string
  amount: number
  timestamp: string
}

interface CustomerDashboardProps {
  providerId: string
  customerId: string
}

export function CustomerDashboard({ providerId, customerId }: CustomerDashboardProps) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [customerAddress, setCustomerAddress] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [customerError, setCustomerError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch meals
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('provider_id', providerId)
        .eq('date', today)
        .order('meal_type', { ascending: true })

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('provider_id', providerId)
        .eq('customer_id', customerId)
        .order('timestamp', { ascending: false })

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('provider_id', providerId)
        .eq('customer_id', customerId)
        .order('timestamp', { ascending: false }) as { data: Payment[] | null }

      // Fetch customer data
      const { data: customerData } = await supabase
        .from('customers')
        .select('current_balance, address')
        .eq('id', customerId)
        .maybeSingle()

      if (!customerData) {
        setCustomerError("Your account setup is incomplete. Please contact support.")
        setIsLoading(false)
        return
      }

      setMeals(mealsData || [])
      setOrders(ordersData || [])
      setPayments(paymentsData || [])
      setBalance(customerData?.current_balance || 0)
      setCustomerAddress(customerData?.address || "")
      setIsLoading(false)
    }

    loadData()

    // Set up Realtime subscription for meal updates
    const mealsChannel = supabase
      .channel('customer-meals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
          filter: `provider_id=eq.${providerId}`,
        },
        (payload) => {
          const today = new Date().toISOString().split('T')[0]
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const meal = payload.new as Meal
            if (meal.date === today) {
              setMeals((current) => {
                const existing = current.find(m => m.id === meal.id)
                if (existing) {
                  return current.map(m => m.id === meal.id ? meal : m)
                }
                return [...current, meal].sort((a, b) => a.meal_type.localeCompare(b.meal_type))
              })
            }
          } else if (payload.eventType === 'DELETE') {
            setMeals((current) => current.filter(m => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Set up Realtime subscription for order updates
    const ordersChannel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((current) => [payload.new as Order, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setOrders((current) =>
              current.map(o => o.id === (payload.new as Order).id ? payload.new as Order : o)
            )
          } else if (payload.eventType === 'DELETE') {
            setOrders((current) => current.filter(o => o.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Set up Realtime subscription for payment updates
    const paymentsChannel = supabase
      .channel('customer-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPayment = payload.new as any as Payment
            setPayments((current) => [newPayment, ...current])
          } else if (payload.eventType === 'UPDATE') {
            const updatedPayment = payload.new as any as Payment
            setPayments((current) =>
              current.map(p => p.id === updatedPayment.id ? updatedPayment : p)
            )
          }
        }
      )
      .subscribe()

    // Set up Realtime subscription for customer balance updates
    const customerChannel = supabase
      .channel('customer-data')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customers',
          filter: `id=eq.${customerId}`,
        },
        (payload) => {
          const updated = payload.new as any
          setBalance(updated.current_balance || 0)
          setCustomerAddress(updated.address || "")
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(mealsChannel)
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(paymentsChannel)
      supabase.removeChannel(customerChannel)
    }
  }, [providerId, customerId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading meals...</p>
        </div>
      </div>
    )
  }

  if (customerError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="text-destructive font-semibold">Account Setup Error</div>
          <p className="text-muted-foreground">{customerError}</p>
        </div>
      </div>
    )
  }

  const todaysMeals = meals.filter(meal => meal.date === new Date().toISOString().split('T')[0])
  
  // Group meals by type
  const groupedMeals = {
    breakfast: todaysMeals.filter(m => m.meal_type.toLowerCase() === 'breakfast'),
    lunch: todaysMeals.filter(m => m.meal_type.toLowerCase() === 'lunch'),
    dinner: todaysMeals.filter(m => m.meal_type.toLowerCase() === 'dinner'),
  }

  // Find existing orders for today's meals
  const getExistingOrder = (mealId: string) => {
    return orders.find(order => order.meal_id === mealId)
  }

  const handleBalanceUpdate = async () => {
    const { data } = await supabase
      .from('customers')
      .select('current_balance')
      .eq('id', customerId)
      .single()
    
    if (data) {
      setBalance(data.current_balance)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <CustomerHeader customerId={customerId} providerId={providerId} />

      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order">Order</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="space-y-6 mt-4">
          {todaysMeals.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">No meals available for today</p>
            </div>
          ) : (
            <>
              {groupedMeals.breakfast.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold capitalize">Breakfast</h3>
                  {groupedMeals.breakfast.map((meal) => (
                    <MealCard 
                      key={meal.id} 
                      meal={meal} 
                      customerId={customerId}
                      providerId={providerId}
                      existingOrder={getExistingOrder(meal.id)}
                      deliveryAddress={customerAddress}
                    />
                  ))}
                </div>
              )}

              {groupedMeals.lunch.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold capitalize">Lunch</h3>
                  {groupedMeals.lunch.map((meal) => (
                    <MealCard 
                      key={meal.id} 
                      meal={meal} 
                      customerId={customerId}
                      providerId={providerId}
                      existingOrder={getExistingOrder(meal.id)}
                      deliveryAddress={customerAddress}
                    />
                  ))}
                </div>
              )}

              {groupedMeals.dinner.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold capitalize">Dinner</h3>
                  {groupedMeals.dinner.map((meal) => (
                    <MealCard 
                      key={meal.id} 
                      meal={meal} 
                      customerId={customerId}
                      providerId={providerId}
                      existingOrder={getExistingOrder(meal.id)}
                      deliveryAddress={customerAddress}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <OrderHistory orders={orders} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 mt-4">
          <BalanceCard balance={balance} onBalanceUpdate={handleBalanceUpdate} />
          <PaymentHistory payments={payments as any} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
