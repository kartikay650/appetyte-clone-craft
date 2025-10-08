import type { User, Meal, Order, Payment, AuthUser } from "./types"
import { mockUsers, mockMeals, mockOrders, mockPayments } from "./mock-data"

// Simple in-memory data store for the MVP
class DataStore {
  private users: User[] = [...mockUsers]
  private meals: Meal[] = [...mockMeals]
  private orders: Order[] = [...mockOrders]
  private payments: Payment[] = [...mockPayments]
  private currentUser: AuthUser | null = null

  // Auth methods
  login(mobile_number: string): AuthUser | null {
    console.log("[v0] DataStore login called with:", mobile_number)
    console.log(
      "[v0] Available users:",
      this.users.map((u) => ({ mobile: u.mobile_number, name: u.name })),
    )
    const user = this.users.find((u) => u.mobile_number === mobile_number)
    console.log("[v0] Found user:", user)
    if (user) {
      this.currentUser = {
        id: user.id,
        mobile_number: user.mobile_number,
        name: user.name,
        role: user.role,
      }
      console.log("[v0] Created auth user:", this.currentUser)
      return this.currentUser
    }
    return null
  }

  logout() {
    this.currentUser = null
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  // User methods
  getUsers(): User[] {
    return this.users
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id)
  }

  updateUserBalance(userId: string, amount: number): void {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.current_balance += amount
    }
  }

  // Meal methods
  getMeals(): Meal[] {
    return this.meals
  }

  getMealsByDate(date: string): Meal[] {
    return this.meals.filter((m) => m.date === date)
  }

  addMeal(meal: Omit<Meal, "id" | "created_at">): Meal {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }
    this.meals.push(newMeal)
    return newMeal
  }

  // Order methods
  getOrders(): Order[] {
    return this.orders
  }

  getOrdersByUserId(userId: string): Order[] {
    return this.orders.filter((o) => o.user_id === userId)
  }

  addOrder(order: Omit<Order, "id">): Order {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
    }
    this.orders.push(newOrder)

    // Update user balance
    this.updateUserBalance(order.user_id, -order.amount)

    return newOrder
  }

  updateOrderStatus(orderId: string, status: Order["status"]): void {
    const order = this.orders.find((o) => o.id === orderId)
    if (order) {
      order.status = status
    }
  }

  cancelOrder(orderId: string): void {
    const order = this.orders.find((o) => o.id === orderId)
    if (order && order.status === "pending") {
      order.status = "cancelled"
      // Refund the amount to user balance
      this.updateUserBalance(order.user_id, order.amount)
    }
  }

  // Payment methods
  getPayments(): Payment[] {
    return this.payments
  }

  getPaymentsByUserId(userId: string): Payment[] {
    return this.payments.filter((p) => p.user_id === userId)
  }

  addPayment(payment: Omit<Payment, "id">): Payment {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
    }
    this.payments.push(newPayment)

    // Update user balance if payment is successful
    if (payment.status === "paid") {
      this.updateUserBalance(payment.user_id, payment.amount)
    }

    return newPayment
  }

  // Utility methods
  getTodaysMeals(): Meal[] {
    const today = new Date().toISOString().split("T")[0]
    return this.getMealsByDate(today)
  }

  isOrderingAllowed(meal: Meal): boolean {
    const now = new Date()
    const today = now.toISOString().split("T")[0]

    if (meal.date !== today) return false

    const [hours, minutes] = meal.cut_off_time.split(":").map(Number)
    const cutOffTime = new Date()
    cutOffTime.setHours(hours, minutes, 0, 0)

    return now < cutOffTime
  }
}

// Export singleton instance
export const dataStore = new DataStore()
