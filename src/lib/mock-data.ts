import type { User, Meal, Order, Payment } from "./types"

// Mock users data
export const mockUsers: User[] = [
  {
    id: "1",
    mobile_number: "9876543210",
    name: "Priya Sharma",
    address: "123 MG Road, Bangalore",
    current_balance: -150,
    role: "customer",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    mobile_number: "9876543211",
    name: "Rahul Kumar",
    address: "456 Brigade Road, Bangalore",
    current_balance: -75,
    role: "customer",
    created_at: "2024-01-16T10:00:00Z",
  },
  {
    id: "3",
    mobile_number: "9876543212",
    name: "Anita Aunty",
    address: "789 Koramangala, Bangalore",
    current_balance: 0,
    role: "admin",
    created_at: "2024-01-10T10:00:00Z",
  },
]

// Mock meals data for today and tomorrow
const today = new Date().toISOString().split("T")[0]
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]

export const mockMeals: Meal[] = [
  {
    id: "1",
    date: today,
    meal_type: "breakfast",
    option_1: "Idli Sambar",
    option_2: "Poha",
    price: 40,
    cut_off_time: "08:30",
    created_at: "2024-01-20T06:00:00Z",
  },
  {
    id: "2",
    date: today,
    meal_type: "lunch",
    option_1: "Dal Rice with Sabzi",
    option_2: "Rajma Chawal",
    price: 80,
    cut_off_time: "11:00",
    created_at: "2024-01-20T06:00:00Z",
  },
  {
    id: "3",
    date: today,
    meal_type: "dinner",
    option_1: "Roti Sabzi",
    option_2: "Biryani",
    price: 90,
    cut_off_time: "17:00",
    created_at: "2024-01-20T06:00:00Z",
  },
  {
    id: "4",
    date: tomorrow,
    meal_type: "breakfast",
    option_1: "Dosa Chutney",
    option_2: "Upma",
    price: 45,
    cut_off_time: "08:30",
    created_at: "2024-01-20T18:00:00Z",
  },
]

export const mockOrders: Order[] = [
  {
    id: "1",
    user_id: "1",
    meal_id: "1",
    selected_option: "Idli Sambar",
    delivery_address: "WeWork",
    timestamp: "2024-01-20T07:30:00Z",
    status: "delivered",
    amount: 40,
  },
  {
    id: "2",
    user_id: "1",
    meal_id: "2",
    selected_option: "Dal Rice with Sabzi",
    delivery_address: "YS-P1",
    timestamp: "2024-01-20T10:30:00Z",
    status: "confirmed",
    amount: 80,
  },
  {
    id: "3",
    user_id: "2",
    meal_id: "1",
    selected_option: "Poha",
    delivery_address: "YS-P2",
    timestamp: "2024-01-20T08:00:00Z",
    status: "delivered",
    amount: 40,
  },
]

// Mock payments data
export const mockPayments: Payment[] = [
  {
    id: "1",
    user_id: "1",
    amount: 200,
    status: "paid",
    timestamp: "2024-01-19T14:30:00Z",
    razorpay_transaction_id: "pay_123456789",
  },
  {
    id: "2",
    user_id: "2",
    amount: 100,
    status: "pending",
    timestamp: "2024-01-20T12:00:00Z",
  },
]
