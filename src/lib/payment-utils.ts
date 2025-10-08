// Payment utility functions for Razorpay integration

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill: {
    name: string
    email?: string
    contact: string
  }
  theme: {
    color: string
  }
}

export function createRazorpayOrder(amount: number, customerName: string, customerPhone: string): RazorpayOptions {
  return {
    key: "rzp_test_1234567890", // Demo key
    amount: amount * 100, // Razorpay expects amount in paise
    currency: "INR",
    name: "Appetyte",
    description: "Tiffin Service Payment",
    order_id: `order_${Date.now()}`,
    handler: (response) => {
      console.log("Payment successful:", response)
    },
    prefill: {
      name: customerName,
      contact: customerPhone,
    },
    theme: {
      color: "#3B82F6",
    },
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function generateTransactionId(): string {
  return `pay_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
}
