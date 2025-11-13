import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { DeliveryAddressManagement } from "./delivery-address-management"

interface DeliverySettings {
  mode: "custom" | "fixed"
}

interface ProviderDeliverySettingsProps {
  providerId: string
}

export function ProviderDeliverySettings({ providerId }: ProviderDeliverySettingsProps) {
  const [settings, setSettings] = useState<DeliverySettings>({ mode: "custom" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [providerId])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("providers")
        .select("delivery_settings_json")
        .eq("id", providerId)
        .single()

      if (error) throw error

      const savedSettings = (data?.delivery_settings_json as unknown || { mode: "custom" }) as DeliverySettings
      setSettings(savedSettings)
    } catch (error) {
      console.error("Error fetching delivery settings:", error)
      toast({
        title: "Error",
        description: "Failed to load delivery settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const newSettings: DeliverySettings = {
        mode: settings.mode,
      }

      const { error } = await supabase
        .from("providers")
        .update({ delivery_settings_json: newSettings as any })
        .eq("id", providerId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Delivery settings updated successfully",
      })
    } catch (error) {
      console.error("Error saving delivery settings:", error)
      toast({
        title: "Error",
        description: "Failed to save delivery settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Mode</CardTitle>
          <CardDescription>
            Choose how customers provide delivery addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={settings.mode}
            onValueChange={(value) => setSettings({ ...settings, mode: value as "custom" | "fixed" })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="cursor-pointer">
                Customer enters custom delivery address
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed" className="cursor-pointer">
                Fixed delivery locations (customers choose from predefined addresses)
              </Label>
            </div>
          </RadioGroup>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Delivery Mode"}
          </Button>
        </CardContent>
      </Card>

      {settings.mode === "fixed" && (
        <DeliveryAddressManagement providerId={providerId} />
      )}
    </div>
  )
}
