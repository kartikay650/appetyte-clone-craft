import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils/time"
import type { Payment } from "@/lib/types"

interface PaymentHistoryProps {
  payments: Payment[]
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
      case "pending":
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
      case "failed":
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
      default:
        return null
    }
  }

  const sortedPayments = [...payments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">No payments yet</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Your payment history will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold">Payment History</h3>
        <div className="text-left sm:text-right">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Paid</p>
          <p className="text-base sm:text-lg font-bold text-green-600 flex items-center">
            <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            {totalPaid}
          </p>
        </div>
      </div>

      {sortedPayments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />₹{payment.amount}
                  {getStatusIcon(payment.status)}
                </CardTitle>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatDate(payment.timestamp.split("T")[0])}
                  </span>
                  {payment.razorpay_transaction_id && (
                    <span className="text-xs truncate">ID: {payment.razorpay_transaction_id}</span>
                  )}
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(payment.status)} text-xs`}>{payment.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {payment.status === "paid" && (
                <p className="text-xs sm:text-sm text-green-600">Payment completed successfully</p>
              )}
              {payment.status === "pending" && (
                <p className="text-xs sm:text-sm text-yellow-600">Payment is being processed</p>
              )}
              {payment.status === "failed" && (
                <p className="text-xs sm:text-sm text-red-600">Payment failed. Please try again.</p>
              )}
              <p className="text-xs text-muted-foreground">Payment ID: {payment.id}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
