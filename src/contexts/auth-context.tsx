import React, { createContext, useContext, useState, useEffect } from "react"
import type { AuthUser } from "@/lib/types"
import { supabase } from "@/integrations/supabase/client"

interface AuthContextType {
  user: AuthUser | null
  login: (mobile_number: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check Supabase session first
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Fetch provider data
        const { data: provider } = await (supabase as any)
          .from('providers')
          .select('business_name, sub_url')
          .eq('id', session.user.id)
          .maybeSingle()

        if (provider) {
          setUser({
            id: session.user.id,
            mobile_number: '', // Not used for providers
            name: provider.business_name,
            role: 'admin'
          })
        }
      }
      
      setIsLoading(false)
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch provider data
        const { data: provider } = await (supabase as any)
          .from('providers')
          .select('business_name, sub_url')
          .eq('id', session.user.id)
          .maybeSingle()

        if (provider) {
          setUser({
            id: session.user.id,
            mobile_number: '',
            name: provider.business_name,
            role: 'admin'
          })
        }
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = (mobile_number: string): boolean => {
    // Legacy mobile login - not used for providers
    return false
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
