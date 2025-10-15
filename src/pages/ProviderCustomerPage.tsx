import { useParams, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"
import { CustomerAuth } from "@/components/customer/CustomerAuth"
import type { User } from "@supabase/supabase-js"

export default function ProviderCustomerPage() {
  const { subUrl } = useParams<{ subUrl: string }>()
  const [providerId, setProviderId] = useState<string | null>(null)
  const [customer, setCustomer] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkProviderAndAuth = async () => {
      // Check 1: Validate provider exists
      // SECURITY: Only select safe, public fields - never expose email, phone, owner name, etc.
      const { data: provider, error } = await supabase
        .from('providers')
        .select('id, sub_url, business_name')
        .eq('sub_url', subUrl)
        .maybeSingle()

      if (error || !provider) {
        setProviderId(null)
        setIsLoading(false)
        return
      }

      setProviderId(provider.id)

      // Check 2: Check customer session
      const { data: { user } } = await supabase.auth.getUser()
      setCustomer(user)
      setIsLoading(false)
    }

    checkProviderAndAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCustomer(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [subUrl])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!providerId) {
    return <Navigate to="/" replace />
  }

  // If no customer session, show auth page
  if (!customer) {
    return <CustomerAuth providerId={providerId} />
  }

  return (
    <main className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
      <CustomerDashboard providerId={providerId} customerId={customer.id} />
    </main>
  )
}
