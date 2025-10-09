import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IndianRupee, Phone, MapPin, AlertCircle } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"

interface CustomerManagementProps {
  customers: User[]
  onCustomerUpdate: () => void
}

export function CustomerManagement({ customers, onCustomerUpdate }: CustomerManagementProps) {
  const { toast } = useToast()

  const sendPaymentReminder = (customer: User) => {
    // In a real app, this would send a WhatsApp message or SMS
    toast({
      title: "Payment reminder sent",
      description: `Reminder sent to ${customer.name} for ₹${Math.abs(customer.current_balance)}`,
    })
  }

  const customersWithDues = customers.filter((c) => c.current_balance < 0)
  const totalOutstanding = customers.reduce((sum, c) => sum + Math.abs(Math.min(0, c.current_balance)), 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customers with Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{customersWithDues.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive flex items-center">
              <IndianRupee className="h-5 w-5 mr-1" />
              {totalOutstanding}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer List</h3>
        <p className="text-sm text-muted-foreground">{customers.length} customers</p>
      </div>

      <div className="grid gap-4">
        {customers.map((customer) => {
          const orders = dataStore.getOrdersByUserId(customer.id)
          const totalOrders = orders.length
          const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0)
          const hasOutstanding = customer.current_balance < 0

          return (
            <Card key={customer.id} className={hasOutstanding ? "border-destructive" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {customer.name}
                      {hasOutstanding && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.mobile_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {customer.address}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${hasOutstanding ? "text-destructive" : "text-green-600"}`}>
                      {hasOutstanding ? "-" : "+"}₹{Math.abs(customer.current_balance)}
                    </div>
                    <div className="text-xs text-muted-foreground">{hasOutstanding ? "Outstanding" : "Credit"}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Orders</p>
                    <p className="font-medium">{totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Spent</p>
                    <p className="font-medium">₹{totalSpent}</p>
                  </div>
                </div>

                {hasOutstanding && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => sendPaymentReminder(customer)}>
                      Send Payment Reminder
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">Customer ID: {customer.id}</p>
              </CardContent>
            </Card>
          )
        })}

        {customers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No customers found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
