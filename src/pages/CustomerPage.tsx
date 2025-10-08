import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"

export default function CustomerPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <Header />
      <main className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        <CustomerDashboard />
      </main>
    </ProtectedRoute>
  )
}
