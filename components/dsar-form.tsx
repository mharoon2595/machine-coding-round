"use client";

import { useState } from "react";
import { submitDsarRequest } from "@/app/actions/dsar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Loader2, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  ShieldCheck,
  Send
} from "lucide-react";

interface DsarFormProps {
  companyId: number;
  ownerId: number;
  companyName: string;
}

export function DsarForm({ companyId, ownerId, companyName }: DsarFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    requestText: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await submitDsarRequest({
        ...formData,
        companyId,
        ownerId,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong while submitting your request.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-12 text-center bg-green-50 dark:bg-green-900/20 border-2 border-dashed border-green-200 dark:border-green-800 rounded-3xl animate-in zoom-in-95 duration-500">
        <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-4">Request Submitted Securely</h2>
        <p className="text-lg text-green-700 dark:text-green-400 max-w-md mx-auto mb-8">
          Thank you. {companyName} has received your Data Subject Access Request. They will review it and respond to your provided email address.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setIsSuccess(false)}
          className="border-green-200 hover:bg-green-100"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-blue-600 p-8 text-white relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="h-24 w-24" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Send className="h-7 w-7" /> Submit Privacy Request
          </h2>
          <p className="text-blue-100 mt-2 text-lg">
            Exercise your rights with {companyName}. This form is encrypted and sent directly to the organization's privacy team.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="requesterName" className="font-semibold px-1">Full Name</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
              </div>
              <Input
                id="requesterName"
                placeholder="Jane Doe"
                className="pl-11 h-12 bg-muted/30 focus:bg-background transition-all border-none focus:ring-2 focus:ring-blue-500"
                required
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterEmail" className="font-semibold px-1">Email Address</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
              </div>
              <Input
                id="requesterEmail"
                type="email"
                placeholder="jane@example.com"
                className="pl-11 h-12 bg-muted/30 focus:bg-background transition-all border-none focus:ring-2 focus:ring-blue-500"
                required
                value={formData.requesterEmail}
                onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requesterPhone" className="font-semibold px-1">Phone Number</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Phone className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Input
              id="requesterPhone"
              placeholder="+1 (555) 000-0000"
              className="pl-11 h-12 bg-muted/30 focus:bg-background transition-all border-none focus:ring-2 focus:ring-blue-500"
              required
              value={formData.requesterPhone}
              onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestText" className="font-semibold px-1">Detailed Request Instructions</Label>
          <div className="relative group">
            <div className="absolute top-3 left-3.5 pointer-events-none">
              <MessageSquare className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            </div>
            <Textarea
              id="requestText"
              placeholder="Please describe your request (e.g., 'I want to see all my transaction history' or 'Please delete my account and associated data')."
              className="pl-11 pt-4 min-h-[160px] bg-muted/30 focus:bg-background transition-all border-none focus:ring-2 focus:ring-blue-500 text-base"
              required
              value={formData.requestText}
              onChange={(e) => setFormData({ ...formData, requestText: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground px-1 mt-2">
            Tip: Be specific about the data you are requesting to help the organization process your request faster.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Securely...
            </>
          ) : (
            "Initiate Privacy Request"
          )}
        </Button>
        
        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 uppercase tracking-widest font-bold opacity-60">
          <ShieldCheck className="h-3 w-3" /> Encrypted Endpoint
        </p>
      </form>
    </div>
  );
}
