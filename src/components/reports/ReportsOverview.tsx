import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyDeliverySheet } from "./DailyDeliverySheet"
import { CustomerDuesReport } from "./CustomerDuesReport"
import { SubscriptionTracker } from "./SubscriptionTracker"
import { OtherReports } from "./OtherReports"

interface ReportsOverviewProps {
  providerId: string
}

export function ReportsOverview({ providerId }: ReportsOverviewProps) {
  return (
    <Tabs defaultValue="delivery" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="delivery">Daily Delivery</TabsTrigger>
        <TabsTrigger value="dues">Customer Dues</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        <TabsTrigger value="other">Other Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="delivery" className="mt-6">
        <DailyDeliverySheet providerId={providerId} />
      </TabsContent>
      <TabsContent value="dues" className="mt-6">
        <CustomerDuesReport providerId={providerId} />
      </TabsContent>
      <TabsContent value="subscriptions" className="mt-6">
        <SubscriptionTracker providerId={providerId} />
      </TabsContent>
      <TabsContent value="other" className="mt-6">
        <OtherReports providerId={providerId} />
      </TabsContent>
    </Tabs>
  )
}
