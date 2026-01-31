"use client";

import { useState } from "react";
import { updateDsarStatus } from "@/app/actions/submit-dsar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUSES = [
  { value: "open", label: "Open", color: "bg-amber-100 text-amber-700" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "in_review", label: "In Review", color: "bg-purple-100 text-purple-700" },
  { value: "closed", label: "Closed", color: "bg-green-100 text-green-700" },
];

export function DsarStatusManager({ 
  dsarId, 
  currentStatus, 
  companySlug,
  requesterEmail 
}: { 
  dsarId: number; 
  currentStatus: string; 
  companySlug?: string;
  requesterEmail: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await updateDsarStatus(dsarId, newStatus, companySlug);
      setStatus(newStatus);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
        <Select disabled={isLoading} value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${s.value === status ? 'animate-pulse' : ''} ${s.color.split(' ')[0]}`} />
                  {s.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        asChild
      >
        <a href={`mailto:${requesterEmail}?subject=Regarding your DSAR Request`}>
          <Mail className="h-4 w-4" />
          Contact Requester
        </a>
      </Button>

      {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
    </div>
  );
}
