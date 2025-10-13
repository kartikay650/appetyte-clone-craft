import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, IndianRupee, AlertTriangle } from "lucide-react"
import { useOrderingStatus } from "@/hooks/use-time-updates"
import { formatTime } from "@/lib/utils/time"

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
  onOrderPlaced: () => void
}

export function MealCard({ meal }: MealCardProps) {
  const [selectedOption, setSelectedOption] = useState(meal.option_1)

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
            disabled={true}
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

        <div className="bg-muted/50 border rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Customer ordering will be available soon. Please contact the provider to place your order.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
