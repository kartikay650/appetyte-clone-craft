import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IndianRupee, AlertCircle } from "lucide-react"
import { PaymentModal } from "./payment-modal"

interface BalanceCardProps {
  balance: number
  onBalanceUpdate?: () => void
}

export function BalanceCard({ balance, onBalanceUpdate }: BalanceCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const isNegative = balance < 0
  const absBalance = Math.abs(balance)

  const handlePaymentSuccess = () => {
    onBalanceUpdate?.()
  }

  return (
    <>
      <Card className={`${isNegative ? "border-destructive" : "border-green-500"}`}>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
            Account Balance
            {isNegative && <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {isNegative ? "Amount you owe" : "Credit balance"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <div className={`text-xl sm:text-2xl font-bold ${isNegative ? "text-destructive" : "text-green-600"}`}>
                {isNegative ? "-" : "+"}₹{absBalance}
              </div>
              {isNegative && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Please make a payment to clear your dues
                </p>
              )}
            </div>
            {isNegative && (
              <Button onClick={() => setShowPaymentModal(true)} size="sm" className="w-full sm:w-auto">
                Pay Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        outstandingAmount={absBalance}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  )
}
