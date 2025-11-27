import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, Loader2, CheckCircle, Mail, Calendar, Building2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Invoice, InvoiceItem, Company } from "@shared/schema";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  sent: "bg-blue-500",
  paid: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  cancelled: "Cancelled",
};

function formatCurrency(amount: string | null, currency: string) {
  const value = parseFloat(amount || "0");
  const symbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;
  return `${symbol}${value.toFixed(2)}`;
}

function formatDate(date: string | Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function InvoiceDetail() {
  const [, params] = useRoute("/dashboard/invoices/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invoiceId = params?.id;

  const { data: invoiceData, isLoading } = useQuery<{ invoice: Invoice; items: InvoiceItem[] }>({
    queryKey: ["/api/invoices", invoiceId],
    enabled: !!invoiceId,
  });

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/companies/current"],
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/invoices/${invoiceId}/send`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId] });
      toast({
        title: "Invoice sent!",
        description: "The invoice has been emailed to the client.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invoice",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest("PATCH", `/api/invoices/${invoiceId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices", invoiceId] });
      toast({
        title: "Status updated",
        description: "Invoice status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoiceData?.invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
        <Link href="/dashboard/invoices">
          <Button className="mt-4">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  const { invoice, items } = invoiceData;
  
  const isCompanyProfileIncomplete = !company?.name || !company?.email;

  return (
    <div className="space-y-6 max-w-4xl">
      {isCompanyProfileIncomplete && invoice.status === "draft" && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30" data-testid="alert-company-profile-incomplete">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Complete your company profile</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Your company details will appear on invoices you send. Please{" "}
            <Link href="/dashboard/settings/company" className="underline font-medium" data-testid="link-company-settings">
              update your company settings
            </Link>{" "}
            before sending invoices to clients.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground mt-1">
              Created on {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={invoice.status}
            onValueChange={(status) => updateStatusMutation.mutate(status)}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {invoice.status === "draft" && invoice.clientEmail && (
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending}
              data-testid="button-send-invoice"
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </>
              )}
            </Button>
          )}
          {invoice.status === "sent" && (
            <Badge className="bg-blue-500 text-white">
              <Mail className="h-3 w-3 mr-1" />
              Sent {invoice.sentAt && formatDate(invoice.sentAt)}
            </Badge>
          )}
          {invoice.status === "paid" && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Paid {invoice.paidAt && formatDate(invoice.paidAt)}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Invoice Preview</CardTitle>
            <CardDescription>This is how the invoice will appear to your client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white dark:bg-gray-950">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-primary">{invoice.invoiceNumber}</h2>
                  <p className="text-muted-foreground mt-1">
                    Issued: {formatDate(invoice.issuedDate)}
                  </p>
                  {invoice.dueDate && (
                    <p className="text-muted-foreground">
                      Due: {formatDate(invoice.dueDate)}
                    </p>
                  )}
                </div>
                <Badge className={`${statusColors[invoice.status]} text-white`}>
                  {statusLabels[invoice.status]}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">From</h3>
                  <div className="text-sm">
                    <p className="font-medium">{company?.name || "Your Company"}</p>
                    {company?.address && <p>{company.address}</p>}
                    {company?.email && <p>{company.email}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h3>
                  <div className="text-sm">
                    <p className="font-medium">{invoice.clientName}</p>
                    {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
                    {invoice.clientAddress && <p>{invoice.clientAddress}</p>}
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.total, invoice.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  </div>
                  {parseFloat(invoice.tax || "0") > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(invoice.tax, invoice.currency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Issued Date</p>
                  <p className="font-medium">{formatDate(invoice.issuedDate)}</p>
                </div>
              </div>
              {invoice.dueDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(invoice.total, invoice.currency)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{invoice.clientName}</p>
                </div>
              </div>
              {invoice.clientEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{invoice.clientEmail}</p>
                </div>
              )}
              {!invoice.clientEmail && invoice.status === "draft" && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Add client email to send this invoice
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
