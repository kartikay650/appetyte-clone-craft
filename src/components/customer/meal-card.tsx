import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, IndianRupee, AlertTriangle, MapPin, CheckCircle, XCircle } from "lucide-react"
import { useOrderingStatus } from "@/hooks/use-time-updates"
import { formatTime } from "@/lib/utils/time"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"
import { differenceInMinutes, parse, format } from "date-fns"
import type { DeliveryAddress } from "@/components/admin/delivery-address-management"

interface Meal {
  id: string
  date: string
  meal_type: string
  option_1: string
  option_2?: string
  price: number
  cut_off_time: string
  created_at: string
}

interface Order {
  id: string
  customer_id: string
  provider_id: string
  meal_id: string
  selected_option: string
  delivery_address: string
  status: string
  amount: number
  timestamp: string
  notes?: string
}

interface MealCardProps {
  meal: Meal
  customerId: string
  providerId: string
  existingOrder?: Order
  deliveryAddress: string
}

export function MealCard({ meal, customerId, providerId, existingOrder, deliveryAddress }: MealCardProps) {
  const [selectedOption, setSelectedOption] = useState(meal.option_1)
  const [isOrdering, setIsOrdering] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [customAddress, setCustomAddress] = useState(deliveryAddress || "")
  const [deliveryMode, setDeliveryMode] = useState<"custom" | "fixed">("custom")
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([])

  const { isOrderingAllowed, timeUntilCutoff } = useOrderingStatus(meal.cut_off_time, meal.date)
  
  // Check if customer has already ordered this meal
  const hasOrdered = !!existingOrder && existingOrder.status !== 'canceled'
  
  // Calculate if cancellation is allowed (more than 15 minutes before cutoff)
  const canCancel = () => {
    if (!existingOrder || existingOrder.status === 'canceled') return false
    
    const now = new Date()
    const mealDate = new Date(meal.date)
    const cutoffTime = parse(meal.cut_off_time, "HH:mm:ss", mealDate)
    const minutesUntilCutoff = differenceInMinutes(cutoffTime, now)
    
    return minutesUntilCutoff > 15
  }

  // Fetch delivery settings and addresses
  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        // Fetch delivery mode
        const { data: providerData, error: providerError } = await supabase
          .from("providers")
          .select("delivery_settings_json")
          .eq("id", providerId)
          .single()

        if (providerError) throw providerError

        const settings = (providerData?.delivery_settings_json as unknown || { mode: "custom" }) as { mode: "custom" | "fixed" }
        setDeliveryMode(settings.mode)

        // If fixed mode, fetch addresses
        if (settings.mode === "fixed") {
          const { data: addressData, error: addressError } = await supabase
            .from("delivery_addresses")
            .select("*")
            .eq("provider_id", providerId)
            .eq("active", true)
            .order("name")

          if (addressError) throw addressError
          setDeliveryAddresses(addressData || [])
          
          // Set first address as default if available
          if (addressData && addressData.length > 0) {
            setSelectedAddressId(addressData[0].id)
            setCustomAddress(addressData[0].address)
          }
        }
      } catch (error) {
        console.error("Error fetching delivery data:", error)
      }
    }

    fetchDeliveryData()
  }, [providerId])

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "lunch":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "dinner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getUrgencyLevel = () => {
    if (!isOrderingAllowed) return "closed"
    if (timeUntilCutoff.includes("m left") && !timeUntilCutoff.includes("h")) {
      const minutes = Number.parseInt(timeUntilCutoff.split("m")[0])
      if (minutes <= 15) return "urgent"
      if (minutes <= 30) return "warning"
    }
    return "normal"
  }

  const urgencyLevel = getUrgencyLevel()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handlePlaceOrder = async () => {
    const finalAddress = deliveryMode === "fixed" 
      ? deliveryAddresses.find(addr => addr.id === selectedAddressId)?.address || ""
      : customAddress

    if (!isOrderingAllowed) {
      toast({
        title: "Ordering closed",
        description: "The ordering window for this meal has closed.",
        variant: "destructive",
      })
      return
    }

    if (!finalAddress) {
      toast({
        title: "No delivery address",
        description: "Please enter a delivery address.",
        variant: "destructive",
      })
      return
    }

    setIsOrdering(true)

    try {
      // Use atomic transaction function
      const { data, error } = await supabase.rpc("place_order_atomic", {
        p_customer_id: customerId,
        p_provider_id: providerId,
        p_meal_id: meal.id,
        p_selected_option: selectedOption,
        p_delivery_address: finalAddress,
        p_amount: meal.price,
        p_notes: showNotes ? notes : null,
      })

      if (error) throw error

      toast({
        title: "Order Placed!",
        description: `Your ${selectedOption} order has been placed successfully.`,
      })

      // Reset form
      setNotes("")
      setShowNotes(false)
    } catch (error: any) {
      console.error("Error placing order:", error)
      
      let errorMessage = "Failed to place order. Please try again."
      if (error.message?.includes("Insufficient balance")) {
        errorMessage = "Insufficient balance. Please add funds to your account."
      }
      
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsOrdering(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!existingOrder) return
    
    setIsCanceling(true)
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: "canceled",
          canceled_at: new Date().toISOString()
        })
        .eq("id", existingOrder.id)

      if (error) throw error

      // Refund the amount to customer balance using RPC
      const { error: balanceError } = await supabase.rpc('increment_balance', {
        customer_id: customerId,
        amount: existingOrder.amount
      })

      if (balanceError) {
        console.error("Balance update error:", balanceError)
        // Continue even if balance update fails - the order is already canceled
      }

      // Log refund transaction
      await supabase
        .from("transactions")
        .insert({
          customer_id: customerId,
          provider_id: providerId,
          amount: existingOrder.amount,
          type: "refund",
          order_id: existingOrder.id,
          metadata: { reason: "order_canceled" }
        })

      toast({
        title: "Order canceled",
        description: "Your meal has been canceled successfully and amount refunded.",
      })
      
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error("Error canceling order:", error)
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCanceling(false)
    }
  }

  // STATE 1: Already Ordered or Canceled - Show order details
  if (existingOrder) {
    const isCanceled = existingOrder.status === 'canceled'
    
    return (
      <Card className={isCanceled ? "bg-red-50/50 dark:bg-red-950/20" : "bg-muted/30"}>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="capitalize flex items-center gap-2 text-base sm:text-lg">
                {meal.meal_type}
                <Badge className={`${getMealTypeColor(meal.meal_type)} text-xs`}>{meal.meal_type}</Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-2 text-xs sm:text-sm">
                {isCanceled ? (
                  <>
                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    Order canceled
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    Order placed
                  </>
                )}
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(existingOrder.status)} text-xs`}>
              {existingOrder.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className={`rounded-lg p-3 space-y-2 ${isCanceled ? "bg-background/60" : "bg-background"}`}>
            <div className="flex items-start gap-2">
              {isCanceled ? (
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {isCanceled ? "Canceled order:" : "You ordered:"} {existingOrder.selected_option}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Amount: ₹{existingOrder.amount}</p>
                {isCanceled && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Refunded to your account
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Delivery to:</p>
                <p className="text-sm">{existingOrder.delivery_address}</p>
              </div>
            </div>

            {existingOrder.notes && (
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Notes:</p>
                  <p className="text-sm">{existingOrder.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          {!isCanceled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      onClick={handleCancelOrder}
                      disabled={!canCancel() || isCanceling}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      {isCanceling ? "Canceling..." : "Cancel Meal"}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!canCancel() && (
                  <TooltipContent>
                    <p>Cancellation not allowed after cutoff time (15 min before)</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    )
  }

  // STATE 2: Available for Order - Show meal options and order button
  return (
    <Card
      className={`${!isOrderingAllowed ? "opacity-60" : ""} ${urgencyLevel === "urgent" ? "border-red-500 shadow-red-100 dark:shadow-red-900/20" : urgencyLevel === "warning" ? "border-yellow-500" : ""}`}
    >
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="capitalize flex items-center gap-2 text-base sm:text-lg">
              {meal.meal_type}
              <Badge className={`${getMealTypeColor(meal.meal_type)} text-xs`}>{meal.meal_type}</Badge>
            </CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
                {meal.price}
              </span>
              <span className="flex items-center gap-1 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Order by {formatTime(meal.cut_off_time)}
              </span>
            </CardDescription>
          </div>
          <div className="text-left sm:text-right">
            <div
              className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${isOrderingAllowed ? (urgencyLevel === "urgent" ? "text-red-600" : urgencyLevel === "warning" ? "text-yellow-600" : "text-green-600") : "text-red-600"}`}
            >
              {urgencyLevel === "urgent" && <AlertTriangle className="h-3 w-3" />}
              {timeUntilCutoff}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {urgencyLevel === "urgent" && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-3">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">Hurry! Only {timeUntilCutoff} to order</span>
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs sm:text-sm font-medium">Available options:</Label>
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="mt-2"
            disabled={!isOrderingAllowed}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={meal.option_1} id={`${meal.id}-option1`} />
              <Label htmlFor={`${meal.id}-option1`} className="flex-1 text-xs sm:text-sm">
                {meal.option_1}
              </Label>
            </div>
            {meal.option_2 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={meal.option_2} id={`${meal.id}-option2`} />
                <Label htmlFor={`${meal.id}-option2`} className="flex-1 text-xs sm:text-sm">
                  {meal.option_2}
                </Label>
              </div>
            )}
          </RadioGroup>
        </div>

        <div>
          {deliveryMode === "custom" ? (
            <div className="space-y-2">
              <Label htmlFor="customAddress">Delivery Address</Label>
              <Input
                id="customAddress"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Enter delivery address"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Select Delivery Address</Label>
              <Select value={selectedAddressId} onValueChange={(value) => {
                setSelectedAddressId(value)
                const selectedAddr = deliveryAddresses.find(addr => addr.id === value)
                if (selectedAddr) {
                  setCustomAddress(selectedAddr.address)
                }
              }}>
                <SelectTrigger id="deliveryAddress">
                  <SelectValue placeholder="Choose delivery location" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryAddresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{addr.name}</div>
                          <div className="text-xs text-muted-foreground">{addr.address}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="orderNotes">Add notes (optional)</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
            >
              {showNotes ? "Hide" : "Show"}
            </Button>
          </div>
          {showNotes && (
            <Input
              id="orderNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions?"
            />
          )}
        </div>

        <Button
          className="w-full"
          disabled={!isOrderingAllowed || isOrdering || !customAddress}
          onClick={handlePlaceOrder}
        >
          {isOrdering 
            ? "Placing order..." 
            : !isOrderingAllowed 
            ? "Ordering Closed" 
            : !customAddress 
            ? "Select Address to Order" 
            : "Place Order"}
        </Button>
      </CardContent>
    </Card>
  )
}
