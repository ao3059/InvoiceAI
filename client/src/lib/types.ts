import type { Invoice, Company, Tenant, User, ActivityLog, Subscription, Plan } from "@shared/schema";

export interface DashboardStats {
  totalInvoices: number;
  sentInvoices: number;
  paidInvoices: number;
  totalRevenue: string;
}

export interface TenantMetrics {
  tenantId: string;
  tenantName: string;
  userCount: number;
  planName: string;
  invoiceCount: number;
  invoiceLimit: number;
  lastActive: string;
}

export interface InvoiceWithItems extends Invoice {
  items: Array<{
    id: string;
    description: string;
    quantity: string;
    unitPrice: string;
    total: string;
  }>;
}

export interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxNumber: string;
  logoUrl?: string;
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: Pick<User, "email">;
  tenant?: Pick<Tenant, "name">;
}

export interface TenantWithSubscription extends Tenant {
  subscription?: Subscription & {
    plan?: Plan;
  };
}
