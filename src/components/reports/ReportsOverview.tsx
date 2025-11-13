import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyDeliverySheet } from "./DailyDeliverySheet"
import { CustomerDuesReport } from "./CustomerDuesReport"
import { SubscriptionTracker } from "./SubscriptionTracker"

interface ReportsOverviewProps {
  providerId: string
}

export function ReportsOverview({ providerId }: ReportsOverviewProps) {
  return (
    <Tabs defaultValue="delivery" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="delivery">Daily Delivery</TabsTrigger>
        <TabsTrigger value="dues">Customer Dues</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
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
    </Tabs>
  )
}
