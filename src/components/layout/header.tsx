import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"

export function Header() {
  const [providerName, setProviderName] = useState<string>("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProvider = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await (supabase as any)
          .from('providers')
          .select('business_name')
          .eq('id', user.id)
          .maybeSingle()
        
        if (data) {
          setProviderName(data.business_name)
        }
      }
    }
    fetchProvider()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/provider-login')
  }

  if (!providerName) return null

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg sm:text-xl font-bold text-primary">Appetyte</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm">
            <User className="h-4 w-4" />
            <span>{providerName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
