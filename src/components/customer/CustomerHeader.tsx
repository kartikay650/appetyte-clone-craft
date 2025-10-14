import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { toast } from "@/hooks/use-toast"

interface CustomerHeaderProps {
  customerId: string
  providerId: string
}

export function CustomerHeader({ customerId, providerId }: CustomerHeaderProps) {
  const [customerName, setCustomerName] = useState<string>("")
  const [providerSubUrl, setProviderSubUrl] = useState<string>("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch customer name
      const { data: customerData } = await supabase
        .from("customers")
        .select("name")
        .eq("id", customerId)
        .single()

      if (customerData) {
        setCustomerName(customerData.name)
      }

      // Fetch provider sub_url
      const { data: providerData } = await supabase
        .from("providers")
        .select("sub_url")
        .eq("id", providerId)
        .single()

      if (providerData) {
        setProviderSubUrl(providerData.sub_url)
      }
    }

    fetchData()
  }, [customerId, providerId])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      })
    } else {
      // Redirect to the provider's customer page
      navigate(`/${providerSubUrl}/customer`)
    }
  }

  return (
    <header className="flex items-center justify-between pb-4 border-b">
      <div className="flex items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Appetyte</h1>
      </div>

      <div className="flex-1 text-center hidden sm:block">
        <h2 className="text-base sm:text-lg font-semibold">
          Welcome back, {customerName || "Customer"}!
        </h2>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover z-50">
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
