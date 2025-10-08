import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, User } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg sm:text-xl font-bold text-primary">Appetyte</h1>
          {user.role === "admin" && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Admin</span>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm">
            <User className="h-4 w-4" />
            <span>{user.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
