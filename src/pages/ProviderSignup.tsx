import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { z } from "zod"

const signupSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(100),
  ownerName: z.string().trim().min(1, "Owner name is required").max(100),
  contactNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters"),
  serviceArea: z.string().trim().min(1, "Service area is required").max(200),
})

export default function ProviderSignup() {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    password: "",
    serviceArea: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const checkSubUrlAvailability = async (businessName: string): Promise<boolean> => {
    const subUrl = businessName.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    const { data, error } = await supabase
      .from('providers')
      .select('sub_url')
      .eq('sub_url', subUrl)
      .maybeSingle()

    if (error) {
      console.error('Error checking sub-URL:', error)
      return false
    }

    return !data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = signupSchema.safeParse(formData)
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      })
      return
    }

    setCheckingAvailability(true)
    
    const isAvailable = await checkSubUrlAvailability(formData.businessName)
    setCheckingAvailability(false)

    if (!isAvailable) {
      toast({
        title: "Business Name Taken",
        description: "This business name is already registered. Please choose a different name.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      })

      if (authError) throw authError

      const subUrl = formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')

      const { error: insertError } = await supabase
        .from('providers')
        .insert({
          id: authData.user!.id,
          business_name: formData.businessName,
          owner_name: formData.ownerName,
          contact_number: formData.contactNumber,
          email_id: formData.email,
          password_hash: 'handled_by_auth',
          service_area: formData.serviceArea,
          sub_url: subUrl,
          account_status: 'active',
        })

      if (insertError) throw insertError

      toast({
        title: "Welcome to Appetyte!",
        description: "Your provider dashboard has been created successfully.",
      })

      navigate(`/${subUrl}/admin`)
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Provider Sign Up</CardTitle>
          <CardDescription>Create your Appetyte provider account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  maxLength={10}
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email ID *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceArea">Service Area *</Label>
                <Input
                  id="serviceArea"
                  name="serviceArea"
                  value={formData.serviceArea}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || checkingAvailability}
            >
              {checkingAvailability ? "Checking availability..." : isLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/provider-login")}
              >
                Log in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
