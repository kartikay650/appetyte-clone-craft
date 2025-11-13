import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Printer, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DeliveryOrder {
  customer_name: string
  contact_number: string
  delivery_address: string
  meal_type: string
  selected_option: string
  notes?: string
}

interface GroupedDelivery {
  [address: string]: DeliveryOrder[]
}

interface DailyDeliverySheetProps {
  providerId: string
}

export function DailyDeliverySheet({ providerId }: DailyDeliverySheetProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("all")
  const [deliveryData, setDeliveryData] = useState<GroupedDelivery>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDeliveryData()
  }, [selectedDate, mealTypeFilter, providerId])

  const fetchDeliveryData = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from("orders")
        .select(`
          selected_option,
          notes,
          customers!inner(name, mobile_number),
          meals!inner(date, meal_type),
          delivery_address
        `)
        .eq("provider_id", providerId)
        .eq("meals.date", selectedDate)

      if (mealTypeFilter !== "all") {
        query = query.eq("meals.meal_type", mealTypeFilter)
      }

      const { data, error } = await query

      if (error) throw error

      // Group by delivery address
      const grouped: GroupedDelivery = {}
      data?.forEach((order: any) => {
        const address = order.delivery_address || "No Address Provided"
        if (!grouped[address]) {
          grouped[address] = []
        }
        grouped[address].push({
          customer_name: order.customers.name,
          contact_number: order.customers.mobile_number,
          delivery_address: address,
          meal_type: order.meals.meal_type,
          selected_option: order.selected_option,
          notes: order.notes
        })
      })

      // Sort addresses alphabetically and customers within each address
      Object.keys(grouped).forEach(address => {
        grouped[address].sort((a, b) => a.customer_name.localeCompare(b.customer_name))
      })

      setDeliveryData(grouped)
    } catch (error) {
      console.error("Error fetching delivery data:", error)
      toast({
        title: "Error",
        description: "Failed to load delivery data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = () => {
    const headers = ["Delivery Address", "Customer Name", "Contact Number", "Meal Type", "Meal Items", "Notes"]
    const rows: string[][] = []

    Object.keys(deliveryData).sort().forEach(address => {
      deliveryData[address].forEach(order => {
        rows.push([
          address,
          order.customer_name,
          order.contact_number,
          order.meal_type,
          order.selected_option,
          order.notes || ""
        ])
      })
    })

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `delivery-sheet-${selectedDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text("Daily Delivery Sheet", 14, 20)
    doc.setFontSize(12)
    doc.text(`Date: ${selectedDate}`, 14, 30)
    if (mealTypeFilter !== "all") {
      doc.text(`Meal Type: ${mealTypeFilter}`, 14, 37)
    }

    let yPosition = 45

    Object.keys(deliveryData).sort().forEach(address => {
      // Address header
      doc.setFontSize(14)
      doc.setFont(undefined, "bold")
      doc.text(`📍 ${address}`, 14, yPosition)
      yPosition += 7

      // Customer table for this address
      const tableData = deliveryData[address].map((order, idx) => [
        idx + 1,
        order.customer_name,
        order.contact_number,
        order.meal_type,
        order.selected_option,
        order.notes || ""
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [["#", "Customer", "Contact", "Meal Type", "Items", "Notes"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 },
        didDrawPage: (data) => {
          yPosition = data.cursor?.y || yPosition
        }
      })

      yPosition += 10

      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
    })

    doc.save(`delivery-sheet-${selectedDate}.pdf`)
  }

  const printSheet = () => {
    window.print()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Delivery Address Sheet</CardTitle>
        <CardDescription>
          Printable delivery route sheet organized by address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
              <SelectTrigger id="mealType">
                <SelectValue placeholder="All Meals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meals</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={downloadCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <Button onClick={downloadPDF} variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={printSheet} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading delivery data...</div>
        ) : Object.keys(deliveryData).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found for the selected date and filters
          </div>
        ) : (
          <div className="space-y-6 print:space-y-4">
            {Object.keys(deliveryData).sort().map(address => (
              <div key={address} className="border rounded-lg p-4 print:break-inside-avoid">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-primary">📍</span>
                  {address}
                </h3>
                <div className="space-y-2">
                  {deliveryData[address].map((order, idx) => (
                    <div key={idx} className="flex items-start gap-4 py-2 border-b last:border-0">
                      <span className="font-medium text-muted-foreground w-8">{idx + 1}.</span>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{order.contact_number}</p>
                        </div>
                        <div>
                          <p className="text-sm capitalize">{order.meal_type}</p>
                        </div>
                        <div>
                          <p className="text-sm">{order.selected_option}</p>
                        </div>
                        <div>
                          {order.notes && (
                            <p className="text-sm text-muted-foreground italic">{order.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
