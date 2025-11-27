import { Switch, Route, Link, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
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
import logoImage from "@assets/ChatGPT Image Nov 26, 2025, 06_46_18 PM_1764182886556.png";
import { Loader2 } from "lucide-react";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth/login" />;
  }

  return <>{children}</>;
}

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
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Link href="/dashboard">
                <img src={logoImage} alt="InvoiceAI" className="h-8 w-auto cursor-pointer" />
              </Link>
            </div>
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
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/dashboard/invoices">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <InvoiceList />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/dashboard/invoices/new">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <NewInvoice />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/dashboard/settings/company">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <CompanySettings />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/admin/users">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <AdminUsers />
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/admin/activity">
        {() => (
          <ProtectedRoute>
            <DashboardLayout>
              <AdminActivity />
            </DashboardLayout>
          </ProtectedRoute>
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
