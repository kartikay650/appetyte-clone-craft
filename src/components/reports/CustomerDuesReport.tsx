import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileDown, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface CustomerDue {
  customer_id: string
  customer_name: string
  contact: string
  current_balance: number
  last_payment?: string
}

interface CustomerDuesReportProps {
  providerId: string
}

export function CustomerDuesReport({ providerId }: CustomerDuesReportProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [duesData, setDuesData] = useState<CustomerDue[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDuesData()
  }, [providerId])

  const fetchDuesData = async () => {
    setIsLoading(true)
    try {
      // Fetch customers with negative balances (dues)
      const { data: customers, error } = await supabase
        .from("customers")
        .select("id, name, mobile_number, current_balance")
        .eq("provider_id", providerId)
        .eq("has_subscription", false)
        .lt("current_balance", 0)

      if (error) throw error

      // Get last payment for each customer
      const customersWithPayments = await Promise.all(
        (customers || []).map(async (customer) => {
          const { data: payments } = await supabase
            .from("payments")
            .select("timestamp")
            .eq("customer_id", customer.id)
            .order("timestamp", { ascending: false })
            .limit(1)

          return {
            customer_id: customer.id,
            customer_name: customer.name,
            contact: customer.mobile_number,
            current_balance: customer.current_balance,
            last_payment: payments?.[0]?.timestamp
          }
        })
      )

      setDuesData(customersWithPayments)
    } catch (error) {
      console.error("Error fetching dues data:", error)
      toast({
        title: "Error",
        description: "Failed to load customer dues",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = () => {
    const headers = ["Customer Name", "Contact", "Amount Due", "Last Payment"]
    const rows = duesData.map(due => [
      due.customer_name,
      due.contact,
      Math.abs(due.current_balance).toFixed(2),
      due.last_payment ? new Date(due.last_payment).toLocaleDateString() : "Never"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customer-dues-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Customer Dues Report", 14, 20)
    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableData = duesData.map(due => [
      due.customer_name,
      due.contact,
      `₹${Math.abs(due.current_balance).toFixed(2)}`,
      due.last_payment ? new Date(due.last_payment).toLocaleDateString() : "Never"
    ])

    autoTable(doc, {
      startY: 40,
      head: [["Customer Name", "Contact", "Amount Due", "Last Payment"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38] },
    })

    doc.save(`customer-dues-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const totalDues = duesData.reduce((sum, due) => sum + Math.abs(due.current_balance), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Dues Report</CardTitle>
        <CardDescription>
          Track pending balances for non-subscription customers
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

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Outstanding Dues</p>
          <p className="text-2xl font-bold text-destructive">₹{totalDues.toFixed(2)}</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading dues data...</div>
        ) : duesData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No outstanding dues found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Amount Due</TableHead>
                <TableHead>Last Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duesData.map(due => (
                <TableRow key={due.customer_id}>
                  <TableCell className="font-medium">{due.customer_name}</TableCell>
                  <TableCell>{due.contact}</TableCell>
                  <TableCell className="text-right text-destructive font-semibold">
                    ₹{Math.abs(due.current_balance).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {due.last_payment 
                      ? new Date(due.last_payment).toLocaleDateString()
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
