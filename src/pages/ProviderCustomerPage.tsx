import { useParams, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"

export default function ProviderCustomerPage() {
  const { subUrl } = useParams<{ subUrl: string }>()
  const [providerId, setProviderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkProvider = async () => {
      const { data: provider, error } = await (supabase as any)
        .from('providers')
        .select('id')
        .eq('sub_url', subUrl)
        .maybeSingle()

      if (error || !provider) {
        setProviderId(null)
        setIsLoading(false)
        return
      }

      setProviderId(provider.id)
      setIsLoading(false)
    }

    checkProvider()
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

  return (
    <main className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
      <CustomerDashboard providerId={providerId} />
    </main>
  )
}
