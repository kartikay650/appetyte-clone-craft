import { useParams, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import CustomerPage from "./CustomerPage"

export default function ProviderCustomerPage() {
  const { subUrl } = useParams<{ subUrl: string }>()
  const [isValidProvider, setIsValidProvider] = useState<boolean | null>(null)

  useEffect(() => {
    const checkProvider = async () => {
      const { data: provider, error } = await (supabase as any)
        .from('providers')
        .select('*')
        .eq('sub_url', subUrl)
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
    return <Navigate to="/" replace />
  }

  return <CustomerPage />
}
