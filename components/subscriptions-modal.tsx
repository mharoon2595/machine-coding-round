"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Ban, 
  RefreshCw,
  Building2,
  ExternalLink,
  Loader2,
  Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession } from "@/app/actions/create-stripe-link";

interface Company {
  id: number;
  name: string;
  subscriptionStatus: string | null;
  stripeSubscriptionId: string | null;
}

export function SubscriptionsModal({ companies }: { companies: Company[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case "active":
        return { 
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, 
          label: "Active", 
          class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200" 
        };
      case "trialing":
        return { 
          icon: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin-slow" />, 
          label: "Trialing", 
          class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" 
        };
      case "canceled":
        return { 
          icon: <Ban className="h-4 w-4 text-slate-500" />, 
          label: "Canceled", 
          class: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200" 
        };
      case "past_due":
        return { 
          icon: <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />, 
          label: "Past Due", 
          class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200" 
        };
      default:
        return { 
          icon: <Clock className="h-4 w-4 text-muted-foreground" />, 
          label: "Unpaid", 
          class: "bg-muted text-muted-foreground border-border" 
        };
    }
  };

  const handleCheckout = async (companyId: number, companyName: string) => {
    setLoadingId(companyId);
    try {
      const { url } = await createCheckoutSession(companyId, companyName);
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initiate checkout. Please check your Stripe Secret Key.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2 border-blue-200 text-blue-700 font-semibold shadow-sm"
      >
        <CreditCard className="h-4 w-4" /> Subscriptions
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative p-6 border-b bg-muted/50">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex items-center gap-3">
                 <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                    <CreditCard className="h-6 w-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold tracking-tight">Billing & Subscriptions</h2>
                    <p className="text-sm text-muted-foreground">Manage your payment plans and portal accessibility.</p>
                 </div>
              </div>
            </div>

            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {companies.length === 0 ? (
                <div className="p-20 text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="text-lg font-medium">No organizations found.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {companies.map((company) => {
                    const isSubscribed = company.subscriptionStatus === "active" || company.subscriptionStatus === "trialing";
                    const config = getStatusConfig(company.subscriptionStatus);
                    
                    return (
                      <div key={company.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSubscribed ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg uppercase truncate max-w-[200px]">{company.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.class}`}>
                                {config.icon}
                                {config.label}
                              </Badge>
                              {isSubscribed && (
                                <span className="text-[10px] font-mono text-muted-foreground hidden md:inline">
                                  {company.stripeSubscriptionId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isSubscribed ? (
                            <Button variant="ghost" size="sm" className="h-10 gap-2 text-muted-foreground font-semibold">
                               <Lock className="h-3.5 w-3.5" /> Portal Active
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleCheckout(company.id, company.name)}
                              disabled={loadingId === company.id}
                              className="h-10 px-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                            >
                              {loadingId === company.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>Pay Now <ExternalLink className="h-3.5 w-3.5" /></>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-4">
               <p className="text-xs text-muted-foreground max-w-[280px]">
                 Subscriptions are billed monthly at <strong>£29/company</strong>. Cancel anytime from your billing portal.
               </p>
              <Button onClick={() => setIsOpen(false)} variant="secondary" className="w-full sm:w-auto font-bold px-8">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
