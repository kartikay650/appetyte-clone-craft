import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/customer")
      }
    } else {
      navigate("/")
    }
  }, [user, navigate])

  return (
    <ProtectedRoute>
      <Header />
      <main className="container mx-auto p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting...</p>
        </div>
      </main>
    </ProtectedRoute>
  )
}
