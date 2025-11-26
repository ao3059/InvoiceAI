import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Company } from "@shared/schema";

export default function CompanySettings() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ["/api/companies/current"],
    retry: false,
  });

  useEffect(() => {
    if (company) {
      setCompanyName(company.name || "");
      setEmail(company.email || "");
      setPhone(company.phone || "");
      setAddress(company.address || "");
      setCity(company.city || "");
      setState(company.state || "");
      setPostalCode(company.postalCode || "");
      setCountry(company.country || "");
      setTaxNumber(company.taxNumber || "");
    }
  }, [company]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!company) {
        return await apiRequest("POST", "/api/companies", data);
      }
      return await apiRequest("PATCH", `/api/companies/${company.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies/current"] });
      toast({
        title: "Settings saved",
        description: "Your company settings have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    saveMutation.mutate({
      name: companyName,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      taxNumber,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "Logo selected",
        description: `Ready to upload: ${file.name}`,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your company profile and branding
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            Upload your company logo to appear on invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-logo-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("logo-upload")?.click()}
                data-testid="button-upload-logo"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Basic details about your company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Your Company Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                data-testid="input-company-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxNumber">Tax Number / VAT</Label>
              <Input
                id="taxNumber"
                placeholder="GB123456789"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                data-testid="input-tax-number"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="info@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+44 20 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="input-phone"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>
            Your company's registered address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Business Street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              data-testid="input-address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="London"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                data-testid="input-city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Region</Label>
              <Input
                id="state"
                placeholder="England"
                value={state}
                onChange={(e) => setState(e.target.value)}
                data-testid="input-state"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="SW1A 1AA"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                data-testid="input-postal-code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="United Kingdom"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                data-testid="input-country"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 sticky bottom-0 bg-background py-4 border-t">
        <Button variant="outline" data-testid="button-cancel">Cancel</Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending || isLoading} data-testid="button-save-settings">
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
