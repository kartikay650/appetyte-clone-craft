import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileDown, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface SubscriptionPayment {
  customer_id: string
  customer_name: string
  customer_email: string
  start_date: string
  end_date: string
  active: boolean
  meal_types: string[]
  last_payment?: string
  status: "active" | "ending-soon" | "expired"
}

interface SubscriptionTrackerProps {
  providerId: string
}

export function SubscriptionTracker({ providerId }: SubscriptionTrackerProps) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionPayment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptionData()
  }, [providerId])

  const fetchSubscriptionData = async () => {
    setIsLoading(true)
    try {
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select(`
          customer_id,
          start_date,
          end_date,
          active,
          meal_types,
          customers!inner(name, email)
        `)
        .eq("provider_id", providerId)
        .order("end_date", { ascending: true })

      if (error) throw error

      const today = new Date()
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(today.getDate() + 7)

      const formattedData = await Promise.all(
        (subscriptions || []).map(async (sub: any) => {
          // Get last payment
          const { data: payments } = await supabase
            .from("payments")
            .select("timestamp")
            .eq("customer_id", sub.customer_id)
            .order("timestamp", { ascending: false })
            .limit(1)

          const endDate = new Date(sub.end_date)
          let status: "active" | "ending-soon" | "expired" = "active"
          
          if (endDate < today) {
            status = "expired"
          } else if (endDate <= sevenDaysFromNow) {
            status = "ending-soon"
          }

          return {
            customer_id: sub.customer_id,
            customer_name: sub.customers.name,
            customer_email: sub.customers.email,
            start_date: sub.start_date,
            end_date: sub.end_date,
            active: sub.active,
            meal_types: sub.meal_types,
            last_payment: payments?.[0]?.timestamp,
            status
          }
        })
      )

      setSubscriptionData(formattedData)
    } catch (error) {
      console.error("Error fetching subscription data:", error)
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = () => {
    const headers = ["Customer Name", "Email", "Meal Types", "Start Date", "End Date", "Status", "Last Payment"]
    const rows = subscriptionData.map(sub => [
      sub.customer_name,
      sub.customer_email,
      sub.meal_types.join(", "),
      new Date(sub.start_date).toLocaleDateString(),
      new Date(sub.end_date).toLocaleDateString(),
      sub.status,
      sub.last_payment ? new Date(sub.last_payment).toLocaleDateString() : "Never"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subscription-tracker-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Subscription Payment Tracker", 14, 20)
    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableData = subscriptionData.map(sub => [
      sub.customer_name,
      sub.meal_types.join(", "),
      new Date(sub.start_date).toLocaleDateString(),
      new Date(sub.end_date).toLocaleDateString(),
      sub.status,
      sub.last_payment ? new Date(sub.last_payment).toLocaleDateString() : "Never"
    ])

    autoTable(doc, {
      startY: 40,
      head: [["Customer", "Meals", "Start", "End", "Status", "Last Payment"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
    })

    doc.save(`subscription-tracker-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
      case "ending-soon":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Ending Soon</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Payment Tracker</CardTitle>
        <CardDescription>
          Track ongoing and expiring subscription payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={downloadCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <Button onClick={downloadPDF} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading subscription data...</div>
        ) : subscriptionData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active subscriptions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Meal Types</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionData.map(sub => (
                <TableRow key={sub.customer_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sub.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{sub.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{sub.meal_types.join(", ")}</TableCell>
                  <TableCell>{new Date(sub.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(sub.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell>
                    {sub.last_payment 
                      ? new Date(sub.last_payment).toLocaleDateString()
                      : <span className="text-muted-foreground">Never</span>
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
