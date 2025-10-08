import React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Header />
      <main className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl">
        <AdminDashboard />
      </main>
    </ProtectedRoute>
  )
}
