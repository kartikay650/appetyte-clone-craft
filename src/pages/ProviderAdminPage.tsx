import { useParams, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ProtectedRoute } from "@/components/auth/protected-route"
import AdminPage from "./AdminPage"

export default function ProviderAdminPage() {
  const { subUrl } = useParams<{ subUrl: string }>()
  const [isValidProvider, setIsValidProvider] = useState<boolean | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const checkProvider = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsValidProvider(false)
        return
      }

      setCurrentUser(user)

      const { data: provider, error } = await (supabase as any)
        .from('providers')
        .select('*')
        .eq('sub_url', subUrl)
        .eq('id', user.id)
        .maybeSingle()

      if (error || !provider) {
        setIsValidProvider(false)
        return
      }

      setIsValidProvider(true)
    }

    checkProvider()
  }, [subUrl])

  if (isValidProvider === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isValidProvider) {
    return <Navigate to="/provider-login" replace />
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPage />
    </ProtectedRoute>
  )
}
