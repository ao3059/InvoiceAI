import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateInvoiceFromDescription } from "./lib/openai";
import { sendInvoiceEmail } from "./lib/resend";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertInvoiceSchema, insertCompanySchema, aiInvoiceResponseSchema } from "@shared/schema";
import { z } from "zod";

// Helper to get user from Replit Auth session
function getAuthUser(req: Request): { id: string; tenantId: string | null } | null {
  const user = req.user as any;
  if (!user?.claims?.sub) return null;
  return {
    id: user.claims.sub,
    tenantId: null, // Will be fetched from database
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Get current authenticated user with full details
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/dashboard/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.json({
          totalInvoices: 0,
          sentInvoices: 0,
          paidInvoices: 0,
          totalRevenue: "£0",
        });
      }

      const invoices = await storage.getInvoices(user.tenantId);
      const totalInvoices = invoices.length;
      const sentInvoices = invoices.filter((i) => i.status === "sent" || i.status === "paid").length;
      const paidInvoices = invoices.filter((i) => i.status === "paid").length;
      const totalRevenue = invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + parseFloat(i.total || "0"), 0);

      res.json({
        totalInvoices,
        sentInvoices,
        paidInvoices,
        totalRevenue: `£${totalRevenue.toFixed(2)}`,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/invoices", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { status, search } = req.query;
      const invoices = await storage.getInvoices(user.tenantId, {
        status: status as string,
        search: search as string,
      });

      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const invoice = await storage.getInvoice(req.params.id);

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      if (invoice.tenantId !== user.tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const items = await storage.getInvoiceItems(invoice.id);

      res.json({ ...invoice, items });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/invoices/generate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { description, clientName, clientEmail } = req.body;

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const aiResponse = await generateInvoiceFromDescription(
        description,
        clientName,
        clientEmail
      );

      const invoiceCount = (await storage.getInvoices(user.tenantId)).length;
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

      const itemsTotal = aiResponse.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const invoice = await storage.createInvoice({
        tenantId: user.tenantId,
        userId: user.id,
        invoiceNumber,
        clientName: aiResponse.client.name,
        clientEmail: aiResponse.client.email || clientEmail || null,
        clientAddress: aiResponse.client.address || null,
        status: "draft",
        currency: aiResponse.currency || "GBP",
        subtotal: itemsTotal.toFixed(2),
        tax: "0",
        total: itemsTotal.toFixed(2),
        notes: aiResponse.notes || null,
        dueDate: aiResponse.due_date ? new Date(aiResponse.due_date) : null,
        issuedDate: new Date(),
      });

      const items = await storage.createInvoiceItems(
        aiResponse.items.map((item) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.price.toFixed(2),
          total: (item.quantity * item.price).toFixed(2),
        }))
      );

      await storage.createActivityLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "invoice_created",
        entityType: "invoice",
        entityId: invoice.id,
        metadata: JSON.stringify({ invoiceNumber: invoice.invoiceNumber }),
      });

      res.json({ invoice, items });
    } catch (error: any) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Send invoice via email
  app.post("/api/invoices/:id/send", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      if (invoice.tenantId !== user.tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!invoice.clientEmail) {
        return res.status(400).json({ message: "Invoice has no client email address" });
      }

      const items = await storage.getInvoiceItems(invoice.id);
      const company = await storage.getCompany(user.tenantId);

      const emailResult = await sendInvoiceEmail({
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total || "0",
        currency: invoice.currency,
        dueDate: invoice.dueDate?.toISOString(),
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity || "1",
          unitPrice: item.unitPrice || "0",
          total: item.total || "0",
        })),
        companyName: company?.name,
        notes: invoice.notes,
      });

      if (!emailResult.success) {
        return res.status(500).json({ message: `Failed to send email: ${emailResult.error}` });
      }

      // Update invoice status to sent
      const updated = await storage.updateInvoice(invoice.id, {
        status: "sent",
        sentAt: new Date(),
      });

      await storage.createActivityLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "invoice_sent",
        entityType: "invoice",
        entityId: invoice.id,
        metadata: JSON.stringify({ 
          invoiceNumber: invoice.invoiceNumber,
          sentTo: invoice.clientEmail,
          messageId: emailResult.messageId,
        }),
      });

      res.json({ success: true, invoice: updated });
    } catch (error: any) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/invoices/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const { status } = req.body;
      const invoice = await storage.getInvoice(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      if (invoice.tenantId !== user.tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates: any = { status };

      if (status === "sent" && !invoice.sentAt) {
        updates.sentAt = new Date();
      } else if (status === "paid" && !invoice.paidAt) {
        updates.paidAt = new Date();
      }

      const updated = await storage.updateInvoice(invoice.id, updates);

      await storage.createActivityLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: `invoice_${status}`,
        entityType: "invoice",
        entityId: invoice.id,
        metadata: JSON.stringify({ invoiceNumber: invoice.invoiceNumber }),
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/companies/current", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const company = await storage.getCompany(user.tenantId);

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/companies", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const data = insertCompanySchema.parse(req.body);

      const existing = await storage.getCompany(user.tenantId);
      if (existing) {
        return res.status(400).json({ message: "Company already exists" });
      }

      const company = await storage.createCompany({
        ...data,
        tenantId: user.tenantId,
      });

      res.json(company);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/companies/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.tenantId) {
        return res.status(403).json({ message: "No tenant access" });
      }

      const company = await storage.getCompany(user.tenantId);

      if (!company || company.id !== req.params.id) {
        return res.status(404).json({ message: "Company not found" });
      }

      const updated = await storage.updateCompany(req.params.id, req.body);

      await storage.createActivityLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "company_updated",
        entityType: "company",
        entityId: req.params.id,
        metadata: null,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/tenants", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tenants = await storage.getTenants();

      const metrics = await Promise.all(
        tenants.map(async (tenant) => {
          const invoices = await storage.getInvoices(tenant.id);
          const subscription = await storage.getSubscription(tenant.id);
          const plan = subscription ? await storage.getPlan(subscription.planId) : null;

          return {
            tenantId: tenant.id,
            tenantName: tenant.name,
            userCount: 1,
            planName: plan?.name || "Free",
            invoiceCount: invoices.length,
            invoiceLimit: plan?.invoiceLimit || 5,
            lastActive: tenant.updatedAt.toISOString(),
          };
        })
      );

      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/activity", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { action, search } = req.query;
      const tenants = await storage.getTenants();

      const allLogs = await Promise.all(
        tenants.map((tenant) =>
          storage.getActivityLogs(tenant.id, {
            action: action as string,
            search: search as string,
          })
        )
      );

      const logs = allLogs.flat().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const logsWithDetails = await Promise.all(
        logs.map(async (log) => {
          const logUser = log.userId ? await storage.getUser(log.userId) : null;
          const tenant = await storage.getTenant(log.tenantId);

          return {
            ...log,
            user: logUser ? { email: logUser.email } : null,
            tenant: tenant ? { name: tenant.name } : null,
          };
        })
      );

      res.json(logsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
