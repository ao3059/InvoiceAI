import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Mail } from "lucide-react";
import { Link, Redirect, useLocation } from "wouter";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/login", { email });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome!",
        description: "You've been logged in successfully.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">InvoiceAI</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome to InvoiceAI</CardTitle>
            <CardDescription>
              Sign in with your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleReplitLogin}
              className="w-full"
              size="lg"
              data-testid="button-sign-in-replit"
            >
              Sign In with Replit
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  data-testid="input-email"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-email-login"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Continue with Email"
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Supported providers
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-6 text-muted-foreground">
              <div className="flex flex-col items-center gap-1">
                <SiGoogle className="h-5 w-5" />
                <span className="text-xs">Google</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <SiGithub className="h-5 w-5" />
                <span className="text-xs">GitHub</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <SiApple className="h-5 w-5" />
                <span className="text-xs">Apple</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              New user? Create an account automatically when you sign in.
            </p>

            <div className="mt-6">
              <Link href="/">
                <Button variant="ghost" className="w-full" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
