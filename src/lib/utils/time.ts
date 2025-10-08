// Time utility functions for the tiffin service

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0]
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":")
  const time = new Date()
  time.setHours(parseInt(hours), parseInt(minutes))

  return time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function isTimeBeforeCutoff(cutoffTime: string): boolean {
  const now = new Date()
  const [hours, minutes] = cutoffTime.split(":").map(Number)
  const cutoff = new Date()
  cutoff.setHours(hours, minutes, 0, 0)

  return now < cutoff
}

export function getTimeUntilCutoff(cutoffTime: string): string {
  const now = new Date()
  const [hours, minutes] = cutoffTime.split(":").map(Number)
  const cutoff = new Date()
  cutoff.setHours(hours, minutes, 0, 0)

  if (now >= cutoff) return "Ordering closed"

  const diff = cutoff.getTime() - now.getTime()
  const hoursLeft = Math.floor(diff / (1000 * 60 * 60))
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hoursLeft > 0) {
    return `${hoursLeft}h ${minutesLeft}m left`
  }
  return `${minutesLeft}m left`
}

export type MealType = "breakfast" | "lunch" | "dinner"

export function getNextMealTime(): { mealType: MealType; timeLeft: string } | null {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  const mealTimes = [
    { type: "breakfast" as MealType, cutoff: "08:30" },
    { type: "lunch" as MealType, cutoff: "11:00" },
    { type: "dinner" as MealType, cutoff: "17:00" },
  ]

  for (const meal of mealTimes) {
    const [hours, minutes] = meal.cutoff.split(":").map(Number)
    if (currentHour < hours || (currentHour === hours && currentMinute < minutes)) {
      return {
        mealType: meal.type,
        timeLeft: getTimeUntilCutoff(meal.cutoff),
      }
    }
  }

  return null
}

export function getMealTimeStatus(cutoffTime: string): "open" | "closing_soon" | "closed" {
  const now = new Date()
  const [hours, minutes] = cutoffTime.split(":").map(Number)
  const cutoff = new Date()
  cutoff.setHours(hours, minutes, 0, 0)

  if (now >= cutoff) return "closed"

  const diff = cutoff.getTime() - now.getTime()
  const minutesLeft = Math.floor(diff / (1000 * 60))

  if (minutesLeft <= 30) return "closing_soon"
  return "open"
}

export function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  return "Just now"
}
