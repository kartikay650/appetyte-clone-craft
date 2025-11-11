import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function PendingApproval() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Subscription Request Pending</CardTitle>
        </div>
        <CardDescription>
          Your subscription request is under review by the admin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Awaiting Approval
          </Badge>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            The admin will review your request shortly. You'll be notified once your subscription is approved.
            In the meantime, you can continue placing regular orders.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
