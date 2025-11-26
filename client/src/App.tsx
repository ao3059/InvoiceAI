import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import DashboardHome from "@/pages/dashboard/home";
import InvoiceList from "@/pages/dashboard/invoices/list";
import NewInvoice from "@/pages/dashboard/invoices/new";
import CompanySettings from "@/pages/dashboard/settings/company";
import AdminUsers from "@/pages/admin/users";
import AdminActivity from "@/pages/admin/activity";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth/login" component={Login} />
      
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/dashboard/invoices">
        {() => (
          <DashboardLayout>
            <InvoiceList />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/dashboard/invoices/new">
        {() => (
          <DashboardLayout>
            <NewInvoice />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/dashboard/settings/company">
        {() => (
          <DashboardLayout>
            <CompanySettings />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/admin/users">
        {() => (
          <DashboardLayout>
            <AdminUsers />
          </DashboardLayout>
        )}
      </Route>
      
      <Route path="/admin/activity">
        {() => (
          <DashboardLayout>
            <AdminActivity />
          </DashboardLayout>
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
