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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Appetyte</CardTitle>
        <CardDescription className="text-center">Login with your mobile number</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              maxLength={10}
              required
            />
            <p className="text-sm text-muted-foreground">Demo: 9876543210 (Customer) or 9876543212 (Admin)</p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
