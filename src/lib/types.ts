// Database schema types based on PRD requirements

export interface User {
  id: string;
  mobile_number: string;
  name: string;
  address: string;
  current_balance: number;
  role: "customer" | "admin";
  created_at: string;
}

export interface Meal {
  id: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  option_1: string;
  option_2?: string;
  price: number;
  cut_off_time: string; // HH:MM format
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  meal_id: string;
  selected_option: string;
  delivery_address: string;
  timestamp: string;
  status: "pending" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";
  amount: number;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  razorpay_transaction_id?: string;
  status: "pending" | "paid" | "failed";
  timestamp: string;
  order_ids?: string[]; // Multiple orders can be paid together
}

export interface AuthUser {
  id: string;
  mobile_number: string;
  name: string;
  role: "customer" | "admin";
}
