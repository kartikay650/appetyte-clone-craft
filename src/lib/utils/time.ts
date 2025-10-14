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
  time.setHours(Number.parseInt(hours), Number.parseInt(minutes))

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

export function getMealTimeStatus(
  cutoffTime: string,
  mealDate: string,
): {
  status: "open" | "closing_soon" | "closed"
  timeLeft: string
  urgency: "normal" | "warning" | "urgent"
} {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  // Check if meal is for today
  if (mealDate !== today) {
    return {
      status: "closed",
      timeLeft: mealDate < today ? "Past date" : "Future date",
      urgency: "normal",
    }
  }

  const [hours, minutes] = cutoffTime.split(":").map(Number)
  const cutoff = new Date()
  cutoff.setHours(hours, minutes, 0, 0)

  if (now >= cutoff) {
    return {
      status: "closed",
      timeLeft: "Ordering closed",
      urgency: "normal",
    }
  }

  const diff = cutoff.getTime() - now.getTime()
  const hoursLeft = Math.floor(diff / (1000 * 60 * 60))
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  let timeLeft: string
  let urgency: "normal" | "warning" | "urgent" = "normal"

  if (hoursLeft > 0) {
    timeLeft = `${hoursLeft}h ${minutesLeft}m left`
    if (hoursLeft === 1) urgency = "warning"
  } else {
    timeLeft = `${minutesLeft}m left`
    if (minutesLeft <= 15) urgency = "urgent"
    else if (minutesLeft <= 30) urgency = "warning"
  }

  return {
    status: urgency === "urgent" ? "closing_soon" : "open",
    timeLeft,
    urgency,
  }
}

export function getNextMealTime(): { mealType: string; cutoffTime: string } | null {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  // Define meal cutoff times in minutes from midnight
  const mealTimes = [
    { mealType: "breakfast", cutoffTime: "08:30", cutoffMinutes: 8 * 60 + 30 },
    { mealType: "lunch", cutoffTime: "11:00", cutoffMinutes: 11 * 60 },
    { mealType: "dinner", cutoffTime: "17:00", cutoffMinutes: 17 * 60 },
  ]

  // Find next meal cutoff
  for (const meal of mealTimes) {
    if (currentTime < meal.cutoffMinutes) {
      return {
        mealType: meal.mealType,
        cutoffTime: meal.cutoffTime,
      }
    }
  }

  // If all meals for today are over, return tomorrow's breakfast
  return {
    mealType: "breakfast",
    cutoffTime: "08:30",
  }
}

// Check if meal can be edited by admin (current time < cutoff time)
export function isMealEditable(mealDate: string, cutoffTime: string): boolean {
  const now = new Date()
  
  // Create full cutoff timestamp (date + time) - using local timezone
  const [hours, minutes] = cutoffTime.split(":").map(Number)
  // Parse date in local timezone by appending time
  const cutoffTimestamp = new Date(`${mealDate}T${cutoffTime}:00`)
  
  // Meal is editable if current time is before the full cutoff timestamp
  return now < cutoffTimestamp
}

// Check if meal should be visible to customer (includes 15-minute grace period)
export function shouldShowMealToCustomer(mealDate: string, cutoffTime: string): boolean {
  const now = new Date()
  
  // Create full cutoff timestamp (date + time) - using local timezone
  // Parse date in local timezone by appending time
  const cutoffTimestamp = new Date(`${mealDate}T${cutoffTime}:00`)
  
  // Add 15-minute grace period
  const cutoffWithGrace = new Date(cutoffTimestamp.getTime() + 15 * 60 * 1000)
  
  // Meal is visible only if current time is before cutoff + grace period
  return now < cutoffWithGrace
}
