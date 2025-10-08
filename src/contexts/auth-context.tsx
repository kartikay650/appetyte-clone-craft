import React, { createContext, useContext, useState, useEffect } from "react"
import type { AuthUser } from "@/lib/types"
import { dataStore } from "@/lib/data-store"

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
    // Check for stored auth on mount
    const storedUser = localStorage.getItem("appetyte_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        localStorage.removeItem("appetyte_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (mobile_number: string): boolean => {
    console.log("[v0] Attempting login with mobile:", mobile_number)
    const authUser = dataStore.login(mobile_number)
    console.log("[v0] Login result:", authUser)
    if (authUser) {
      setUser(authUser)
      localStorage.setItem("appetyte_user", JSON.stringify(authUser))
      console.log("[v0] User logged in successfully:", authUser)
      return true
    }
    console.log("[v0] Login failed - user not found")
    return false
  }

  const logout = () => {
    dataStore.logout()
    setUser(null)
    localStorage.removeItem("appetyte_user")
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
