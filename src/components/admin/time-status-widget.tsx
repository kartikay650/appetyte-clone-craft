import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { useTimeUpdates } from "@/hooks/use-time-updates"
import { getNextMealTime, getMealTimeStatus } from "@/lib/utils/time"

export function TimeStatusWidget() {
  const currentTime = useTimeUpdates(30000) // Update every 30 seconds
  const nextMeal = getNextMealTime()

  const getMealStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "closing_soon":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "closed":
        return <Clock className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "closing_soon":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Current Time
        </CardTitle>
        <CardDescription>Monitor your meal service status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold">{new Date().toLocaleTimeString()}</div>
        
        {nextMeal && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Next meal: {nextMeal.mealType} (cutoff at {nextMeal.cutoffTime})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
