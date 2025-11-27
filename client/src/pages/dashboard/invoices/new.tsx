import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function NewInvoice() {
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const generateMutation = useMutation({
    mutationFn: async (data: { description: string; clientName?: string; clientEmail?: string }) => {
      return await apiRequest("POST", "/api/invoices/generate", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Invoice generated!",
        description: "Your invoice has been created with AI.",
      });
      setLocation(`/dashboard/invoices`);
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the work you did.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format if provided
    if (clientEmail && clientEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientEmail.trim())) {
        toast({
          title: "Invalid email format",
          description: "Please enter a valid email address (e.g., client@example.com)",
          variant: "destructive",
        });
        return;
      }
    }

    generateMutation.mutate({
      description,
      clientName: clientName || undefined,
      clientEmail: clientEmail || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground mt-1">
          Describe your work and let AI generate a professional invoice
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Optional - can be filled later</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="Acme Corporation"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  data-testid="input-client-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  data-testid="input-client-email"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Describe Your Work
              </CardTitle>
              <CardDescription>
                Tell us what you did in natural language. Our AI will extract line items and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Work Description</Label>
                <Textarea
                  id="description"
                  placeholder="I built a custom e-commerce website with 5 product pages, integrated Stripe payments, and provided 2 hours of training. The website development was £2,500 and training was £200."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="resize-none"
                  data-testid="textarea-work-description"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-generate-invoice"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Invoice with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-6 h-fit">
          <CardHeader>
            <CardTitle>Invoice Preview</CardTitle>
            <CardDescription>Preview will appear here after generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Generate your invoice to see a preview</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
