import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IndianRupee, CreditCard, Smartphone } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { dataStore } from "@/lib/data-store"
import { useToast } from "@/hooks/use-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  outstandingAmount: number
  onPaymentSuccess: () => void
}

export function PaymentModal({ isOpen, onClose, outstandingAmount, onPaymentSuccess }: PaymentModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [paymentAmount, setPaymentAmount] = useState(outstandingAmount.toString())
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi")

  const handlePayment = async () => {
    if (!user) return

    const amount = Number.parseFloat(paymentAmount)
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate Razorpay payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock payment success (90% success rate)
      const isSuccess = Math.random() > 0.1

      if (isSuccess) {
        // Create payment record
        dataStore.addPayment({
          user_id: user.id,
          amount: amount,
          status: "paid",
          timestamp: new Date().toISOString(),
          razorpay_transaction_id: `pay_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        })

        toast({
          title: "Payment successful!",
          description: `₹${amount} has been added to your account`,
        })

        onPaymentSuccess()
        onClose()
      } else {
        // Create failed payment record
        dataStore.addPayment({
          user_id: user.id,
          amount: amount,
          status: "failed",
          timestamp: new Date().toISOString(),
        })

        toast({
          title: "Payment failed",
          description: "Please try again or contact support",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Payment error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md mx-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
            Make Payment
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Pay your outstanding balance securely with Razorpay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-muted p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Outstanding Balance</span>
              <span className="text-base sm:text-lg font-bold text-destructive">₹{outstandingAmount}</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm">
                Payment Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={outstandingAmount}
                className="text-base" // Prevents zoom on iOS
              />
              <p className="text-xs text-muted-foreground">
                You can pay partial amount. Minimum: ₹1, Maximum: ₹{outstandingAmount}
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm">Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentMethod === "upi" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("upi")}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                  UPI
                </Button>
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                  Card
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <span className="text-xs sm:text-sm font-medium">Secured by Razorpay</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your payment is processed securely through Razorpay's encrypted gateway
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handlePayment} disabled={isProcessing} className="flex-1 text-sm" size="sm">
              {isProcessing ? "Processing..." : `Pay ₹${paymentAmount}`}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="sm:w-auto text-sm bg-transparent"
              size="sm"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This is a demo payment system. No real money will be charged.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
