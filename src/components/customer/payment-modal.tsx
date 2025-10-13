import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IndianRupee, CreditCard, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  outstandingAmount: number
  onPaymentSuccess: () => void
}

export function PaymentModal({ isOpen, onClose, outstandingAmount, onPaymentSuccess }: PaymentModalProps) {
  const { toast } = useToast()
  const [paymentAmount, setPaymentAmount] = useState(outstandingAmount.toString())
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi")

  const handlePayment = async () => {
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
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Payment feature coming soon",
        description: "Customer payment functionality will be implemented soon.",
      })

      onClose()
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
            Pay your outstanding balance securely
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
                className="text-base"
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
            Payment functionality will be available soon.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
