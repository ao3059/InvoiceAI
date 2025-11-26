import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Send, CheckCircle2, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/lib/types";

export default function DashboardHome() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    initialData: {
      totalInvoices: 0,
      sentInvoices: 0,
      paidInvoices: 0,
      totalRevenue: "£0",
    },
  });

  const statsDisplay = [
    { title: "Total Invoices", value: stats.totalInvoices.toString(), icon: FileText, color: "text-blue-600" },
    { title: "Sent", value: stats.sentInvoices.toString(), icon: Send, color: "text-purple-600" },
    { title: "Paid", value: stats.paidInvoices.toString(), icon: CheckCircle2, color: "text-green-600" },
    { title: "Total Revenue", value: stats.totalRevenue, icon: DollarSign, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your invoicing activity.
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button size="lg" data-testid="button-create-invoice">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invoices yet. Create your first invoice to get started!</p>
            <Link href="/dashboard/invoices/new">
              <Button className="mt-4" data-testid="button-create-first-invoice">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Invoice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
