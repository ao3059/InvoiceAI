import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileText, Zap, Send, BarChart3, CreditCard, Mail, Check } from "lucide-react";
import heroImage from "@assets/generated_images/invoice_generation_hero_background.png";
import logoImage from "@assets/ChatGPT Image Nov 26, 2025, 06_46_18 PM_1764182886556.png";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <img src={logoImage} alt="InvoiceAI" className="h-10 w-auto cursor-pointer" />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" data-testid="button-login">Sign In</Button>
              </Link>
              <Link href="/auth/login">
                <Button data-testid="button-get-started">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Invoice generation" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 lg:py-48">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 bg-background/10 backdrop-blur-sm border-white/20 text-white">
              AI-Powered Invoice Generation
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
              Generate Professional Invoices in Seconds
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Describe your work in plain English. Our AI creates perfect invoices with line items, totals, and professional formatting.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="text-lg px-8" data-testid="button-hero-start-trial">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-background/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20" data-testid="button-hero-demo">
                See Demo
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/70">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Everything you need to invoice faster</h2>
            <p className="text-lg text-muted-foreground">Powerful features that save you time and help you get paid</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "AI-Powered Generation",
                description: "Describe your work in natural language. Our AI extracts clients, line items, and pricing automatically.",
              },
              {
                icon: FileText,
                title: "Professional PDFs",
                description: "Beautiful, customizable invoice templates with your company branding. Download or send instantly.",
              },
              {
                icon: Send,
                title: "Email Delivery",
                description: "Send invoices directly to clients via email. Track when they're viewed and paid.",
              },
              {
                icon: BarChart3,
                title: "Activity Tracking",
                description: "Complete audit log of all invoice actions. See who created, sent, and paid what.",
              },
              {
                icon: CreditCard,
                title: "Stripe Billing",
                description: "Integrated subscription management. Upgrade plans as your business grows.",
              },
              {
                icon: Mail,
                title: "Multi-tenant Ready",
                description: "Built for teams. Invite members, manage permissions, and collaborate seamlessly.",
              },
            ].map((feature, i) => (
              <Card key={i} className="hover-elevate">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Four simple steps from description to payment</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Describe Work", description: "Tell us what you did in plain English" },
              { step: 2, title: "AI Generates", description: "Our AI creates a structured invoice" },
              { step: 3, title: "Preview & Edit", description: "Review and customize before sending" },
              { step: 4, title: "Send & Track", description: "Email to client and monitor status" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Choose the plan that fits your business</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "£0",
                invoices: "5 invoices/month",
                features: ["AI invoice generation", "PDF downloads", "Email sending", "Basic support"],
              },
              {
                name: "Professional",
                price: "£29",
                invoices: "100 invoices/month",
                features: ["Everything in Free", "Custom branding", "Priority support", "Advanced analytics"],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "£99",
                invoices: "Unlimited invoices",
                features: ["Everything in Pro", "Multi-user accounts", "API access", "Dedicated support"],
              },
            ].map((plan) => (
              <Card key={plan.name} className={plan.popular ? "border-primary" : ""}>
                <CardHeader>
                  {plan.popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="text-base mt-2">{plan.invoices}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/login">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} data-testid={`button-plan-${plan.name.toLowerCase()}`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">InvoiceAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional invoice generation powered by AI
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 InvoiceAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
