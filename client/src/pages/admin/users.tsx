import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users as UsersIcon, TrendingUp, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { TenantMetrics } from "@/lib/types";

export default function AdminUsers() {
  const { data: tenants = [] } = useQuery<TenantMetrics[]>({
    queryKey: ["/api/admin/tenants"],
  });

  const stats = [
    { title: "Total Tenants", value: tenants.length.toString(), change: "+0%" },
    { title: "Active Subscriptions", value: "0", change: "+0%" },
    { title: "Total Invoices", value: "0", change: "+0%" },
    { title: "MRR", value: "£0", change: "+0%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor tenants, subscriptions, and usage metrics
          </p>
        </div>
        <Button variant="outline" data-testid="button-export-csv">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenants Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tenants yet. They will appear here when users sign up.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
