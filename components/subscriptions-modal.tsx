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
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Company {
  id: number;
  name: string;
  subscriptionStatus: string | null;
  stripeSubscriptionId: string | null;
}

export function SubscriptionsModal({ companies }: { companies: Company[] }) {
  const [isOpen, setIsOpen] = useState(false);

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
          label: "Inactive", 
          class: "bg-muted text-muted-foreground border-border" 
        };
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
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                Subscription Management
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor and manage billing for all your registered business entities.
              </p>
            </div>

            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {companies.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No companies found to manage subscriptions.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {companies.map((company) => {
                    const config = getStatusConfig(company.subscriptionStatus);
                    return (
                      <div key={company.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{company.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.class}`}>
                                {config.icon}
                                {config.label}
                              </Badge>
                              {company.stripeSubscriptionId && (
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  ID: {company.stripeSubscriptionId.substring(0, 12)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              Manage <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-muted/50 flex justify-end">
              <Button onClick={() => setIsOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Close Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
