"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2, Building2, Globe, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddCompanyModal({ ownerId }: { ownerId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    representation: "",
    slug: "",
    status: "Active",
    stripeCustomerId: "",
    stripeSubscriptionId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { error: insertError } = await supabase.from("company").insert({
        name: formData.name,
        representation: formData.representation,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        status: formData.status,
        ownerId: ownerId,
        stripeCustomerId: formData.stripeCustomerId || null,
        stripeSubscriptionId: formData.stripeSubscriptionId || null,
        subscriptionStatus: formData.stripeSubscriptionId ? "active" : "inactive",
      });

      if (insertError) throw insertError;

      setIsOpen(false);
      setFormData({ 
        name: "", 
        representation: "", 
        slug: "", 
        status: "Active",
        stripeCustomerId: "",
        stripeSubscriptionId: "",
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Company
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="relative p-6 border-b bg-muted/50 sticky top-0 z-10">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Add New Company
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the details of your new business entity and billing information.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">General Info</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Company Name</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="name"
                        placeholder="Acme Corp"
                        className="pl-10"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="representation" className="text-sm font-medium">Representation</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="representation"
                        placeholder="Legal or Business Representation"
                        className="pl-10"
                        required
                        value={formData.representation}
                        onChange={(e) =>
                          setFormData({ ...formData, representation: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium">Slug (Optional)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="slug"
                        placeholder="acme-corp"
                        className="pl-10"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-l pl-6 border-muted">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Billing Info (Stripe)</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeCustomerId" className="text-sm font-medium">Customer ID</Label>
                    <Input
                      id="stripeCustomerId"
                      placeholder="cus_..."
                      className="font-mono text-sm"
                      value={formData.stripeCustomerId}
                      onChange={(e) =>
                        setFormData({ ...formData, stripeCustomerId: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripeSubscriptionId" className="text-sm font-medium">Subscription ID</Label>
                    <Input
                      id="stripeSubscriptionId"
                      placeholder="sub_..."
                      className="font-mono text-sm"
                      value={formData.stripeSubscriptionId}
                      onChange={(e) =>
                        setFormData({ ...formData, stripeSubscriptionId: e.target.value })
                      }
                    />
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mt-4 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed italic">
                      Note: These fields are usually populated automatically via Stripe integration. Adding them manually here is for administrative/manual setup.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Company"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
