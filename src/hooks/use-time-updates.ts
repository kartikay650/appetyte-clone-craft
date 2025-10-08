import { useState, useEffect } from "react"

// Custom hook for real-time time updates
export function useTimeUpdates(intervalMs = 60000) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])

  return currentTime
}

// Hook for checking if ordering is still allowed for a meal
export function useOrderingStatus(cutoffTime: string, mealDate: string) {
  const currentTime = useTimeUpdates(30000) // Update every 30 seconds

  const isOrderingAllowed = () => {
    const now = new Date()
    const today = now.toISOString().split("T")[0]

    // Can't order for past dates
    if (mealDate < today) return false

    // Can't order for future dates (more than today)
    if (mealDate > today) return false

    // Check cutoff time for today
    const [hours, minutes] = cutoffTime.split(":").map(Number)
    const cutoff = new Date()
    cutoff.setHours(hours, minutes, 0, 0)

    return now < cutoff
  }

  const getTimeUntilCutoff = () => {
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

  return {
    isOrderingAllowed: isOrderingAllowed(),
    timeUntilCutoff: getTimeUntilCutoff(),
    currentTime,
  }
}
