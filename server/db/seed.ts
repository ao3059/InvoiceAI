import { db } from "./index";
import { plans } from "@shared/schema";

export async function seedPlans() {
  const existingPlans = await db.select().from(plans);
  
  if (existingPlans.length > 0) {
    console.log("Plans already seeded");
    return;
  }

  await db.insert(plans).values([
    {
      name: "Free",
      tier: "free",
      invoiceLimit: 5,
      price: "0",
      features: ["5 invoices/month", "AI invoice generation", "PDF downloads", "Email sending"],
    },
    {
      name: "Starter",
      tier: "starter",
      invoiceLimit: 50,
      price: "9",
      features: ["50 invoices/month", "Everything in Free", "Custom branding", "Priority support"],
    },
    {
      name: "Professional",
      tier: "professional",
      invoiceLimit: 100,
      price: "29",
      features: ["100 invoices/month", "Everything in Starter", "Advanced analytics", "Multi-user"],
    },
    {
      name: "Enterprise",
      tier: "enterprise",
      invoiceLimit: 999999,
      price: "99",
      features: ["Unlimited invoices", "Everything in Pro", "API access", "Dedicated support"],
    },
  ]);

  console.log("✅ Plans seeded successfully");
}
