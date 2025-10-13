import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, IndianRupee, AlertTriangle } from "lucide-react"
import { useOrderingStatus } from "@/hooks/use-time-updates"
import { formatTime } from "@/lib/utils/time"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Meal {
  id: string
  date: string
  meal_type: string
  option_1: string
  option_2?: string
  price: number
  cut_off_time: string
  created_at: string
}

interface MealCardProps {
  meal: Meal
  customerId: string
  providerId: string
}

export function MealCard({ meal, customerId, providerId }: MealCardProps) {
  const [selectedOption, setSelectedOption] = useState(meal.option_1)
  const [isOrdering, setIsOrdering] = useState(false)

  const { isOrderingAllowed, timeUntilCutoff } = useOrderingStatus(meal.cut_off_time, meal.date)

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

  const getUrgencyLevel = () => {
    if (!isOrderingAllowed) return "closed"
    if (timeUntilCutoff.includes("m left") && !timeUntilCutoff.includes("h")) {
      const minutes = Number.parseInt(timeUntilCutoff.split("m")[0])
      if (minutes <= 15) return "urgent"
      if (minutes <= 30) return "warning"
    }
    return "normal"
  }

  const urgencyLevel = getUrgencyLevel()

  const handlePlaceOrder = async () => {
    if (!isOrderingAllowed) {
      toast({
        title: "Ordering closed",
        description: "The ordering window for this meal has closed.",
        variant: "destructive",
      })
      return
    }

    setIsOrdering(true)

    try {
      // Fetch customer details for delivery address
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("address")
        .eq("id", customerId)
        .single()

      if (customerError) throw customerError

      // Create order
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          provider_id: providerId,
          meal_id: meal.id,
          selected_option: selectedOption,
          amount: meal.price,
          delivery_address: customer.address,
          status: "pending",
        })

      if (orderError) throw orderError

      toast({
        title: "Order placed successfully!",
        description: `Your order for ${meal.meal_type} (${selectedOption}) has been placed.`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <Card
      className={`${!isOrderingAllowed ? "opacity-60" : ""} ${urgencyLevel === "urgent" ? "border-red-500 shadow-red-100 dark:shadow-red-900/20" : urgencyLevel === "warning" ? "border-yellow-500" : ""}`}
    >
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="capitalize flex items-center gap-2 text-base sm:text-lg">
              {meal.meal_type}
              <Badge className={`${getMealTypeColor(meal.meal_type)} text-xs`}>{meal.meal_type}</Badge>
            </CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                {meal.price}
              </span>
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Order by {formatTime(meal.cut_off_time)}
              </span>
            </CardDescription>
          </div>
          <div className="text-left sm:text-right">
            <div
              className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${isOrderingAllowed ? (urgencyLevel === "urgent" ? "text-red-600" : urgencyLevel === "warning" ? "text-yellow-600" : "text-green-600") : "text-red-600"}`}
            >
              {urgencyLevel === "urgent" && <AlertTriangle className="h-3 w-3" />}
              {timeUntilCutoff}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {urgencyLevel === "urgent" && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-3">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">Hurry! Only {timeUntilCutoff} to order</span>
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs sm:text-sm font-medium">Available options:</Label>
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="mt-2"
            disabled={!isOrderingAllowed}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={meal.option_1} id={`${meal.id}-option1`} />
              <Label htmlFor={`${meal.id}-option1`} className="flex-1 text-xs sm:text-sm">
                {meal.option_1}
              </Label>
            </div>
            {meal.option_2 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={meal.option_2} id={`${meal.id}-option2`} />
                <Label htmlFor={`${meal.id}-option2`} className="flex-1 text-xs sm:text-sm">
                  {meal.option_2}
                </Label>
              </div>
            )}
          </RadioGroup>
        </div>

        <Button
          className="w-full"
          disabled={!isOrderingAllowed || isOrdering}
          onClick={handlePlaceOrder}
        >
          {isOrdering ? "Placing order..." : isOrderingAllowed ? "Place Order" : "Ordering Closed"}
        </Button>
      </CardContent>
    </Card>
  )
}
