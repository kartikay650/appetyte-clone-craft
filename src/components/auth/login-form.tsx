import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [mobileNumber, setMobileNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("[v0] Form submitted with mobile:", mobileNumber)

    // Basic mobile number validation
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      console.log("[v0] Mobile number validation failed")
      toast({
        title: "Invalid mobile number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    console.log("[v0] Mobile number validation passed")
    const success = login(mobileNumber)
    console.log("[v0] Login success:", success)

    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome to Appetyte!",
      })
    } else {
      toast({
        title: "Login failed",
        description: "Mobile number not found. Please contact the tiffin service provider.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-sm sm:max-w-md mx-auto">
      <CardHeader className="text-center px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Appetyte</CardTitle>
        <CardDescription className="text-sm">Enter your mobile number to continue</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              maxLength={10}
              required
              className="text-base" // Prevents zoom on iOS
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} size="sm">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted rounded-lg">
          <p className="text-xs sm:text-sm font-medium mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs">
            <p>
              <strong>Customer:</strong> 9876543210 (Priya)
            </p>
            <p>
              <strong>Customer:</strong> 9876543211 (Rahul)
            </p>
            <p>
              <strong>Admin:</strong> 9876543212 (Anita Aunty)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
