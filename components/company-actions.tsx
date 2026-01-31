"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { updateCompanyStatus } from "../app/actions/update-company-status";

export function CompanyActions({ companyId }: { companyId: number }) {
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (status: "Approved" | "Rejected") => {
    setIsLoading(status === "Approved" ? "approve" : "reject");
    setError(null);
    
    try {
      await updateCompanyStatus(companyId, status);
    } catch (err: any) {
      console.error(`Error updating company status`);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          onClick={() => handleAction("Approved")}
          disabled={!!isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 h-12 shadow-sm"
        >
          {isLoading === "approve" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          Approve Company
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={() => handleAction("Rejected")}
          disabled={!!isLoading}
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 h-12"
        >
          {isLoading === "reject" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          Reject Application
        </Button>
      </div>
    </div>
  );
}

