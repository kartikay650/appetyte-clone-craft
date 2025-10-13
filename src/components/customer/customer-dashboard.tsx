import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MealCard } from "./meal-card"
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

interface CustomerDashboardProps {
  providerId: string
  customerId: string
}

export function CustomerDashboard({ providerId, customerId }: CustomerDashboardProps) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMeals = async () => {
      setIsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('provider_id', providerId)
        .eq('date', today)
        .order('meal_type', { ascending: true })

      setMeals(mealsData || [])
      setIsLoading(false)
    }

    loadMeals()

    // Set up Realtime subscription for meal updates
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel)
    }
  }, [providerId])

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

  const todaysMeals = meals.filter(meal => meal.date === new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome to Appetyte</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Order your delicious meals</p>
      </div>

      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="order">Today's Menu</TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="space-y-3 sm:space-y-4">
          {todaysMeals.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">No meals available for today</p>
            </div>
          ) : (
            todaysMeals.map((meal) => (
              <MealCard 
                key={meal.id} 
                meal={meal} 
                customerId={customerId}
                providerId={providerId}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
