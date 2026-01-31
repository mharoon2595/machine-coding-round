import { 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  User, 
  Clock,
  ExternalLink,
  Inbox
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DsarStatusManager } from "@/components/dsar-status-manager";

interface DsarListProps {
  dsars: any[];
  count: number;
  page: number;
  pageSize: number;
  statusFilter: string | undefined;
  baseUrl: string;
  company: any;
}

export function DsarList({ 
  dsars, 
  count, 
  page, 
  pageSize, 
  statusFilter, 
  baseUrl, 
  company 
}: DsarListProps) {
  const totalPages = Math.ceil((count || 0) / pageSize);
  const from = (page - 1) * pageSize;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Inbox className="h-6 w-6 text-blue-600" />
          DSAR Requests Feed
        </h2>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Link href={`${baseUrl}?page=1&status=all`}>
            <Button variant={!statusFilter || statusFilter === "all" ? "default" : "outline"} size="sm" className="h-8">
              All
            </Button>
          </Link>
          <Link href={`${baseUrl}?page=1&status=open`}>
            <Button variant={statusFilter === "open" ? "default" : "outline"} size="sm" className="h-8">
              Open
            </Button>
          </Link>
          <Link href={`${baseUrl}?page=1&status=in_progress`}>
            <Button variant={statusFilter === "in_progress" ? "default" : "outline"} size="sm" className="h-8">
              In Progress
            </Button>
          </Link>
          <Link href={`${baseUrl}?page=1&status=in_review`}>
            <Button variant={statusFilter === "in_review" ? "default" : "outline"} size="sm" className="h-8">
              In Review
            </Button>
          </Link>
          <Link href={`${baseUrl}?page=1&status=closed`}>
            <Button variant={statusFilter === "closed" ? "default" : "outline"} size="sm" className="h-8">
              Closed
            </Button>
          </Link>
        </div>
      </div>

      {!dsars || dsars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No requests found</h3>
          <p className="text-muted-foreground mt-1 text-center max-w-sm">
            {statusFilter && statusFilter !== "all" 
              ? `No requests currently match the "${statusFilter.replace('_', ' ')}" filter.`
              : (["Active", "Approved"].includes(company.status) && company.subscriptionStatus === "active" 
                  ? "Your public [DSAR Portal Page] is active. Customers can submit requests there." 
                  : "Public [DSAR Portal Page] is not active as it is either pending admin approval or subscription is not active or both.")
            }
          </p>
          <Link href={`/dsar/${company.slug}`} target="_blank" className="mt-6">
             <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" /> View Public Portal
             </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {dsars.map((dsar) => (
            <Card key={dsar.id} className="overflow-hidden hover:border-blue-200 transition-all duration-300 group shadow-sm">
              <div className="flex flex-col lg:flex-row">
                <div className={`w-2 ${
                  dsar.status === 'open' ? 'bg-amber-400' : 
                  dsar.status === 'in_progress' ? 'bg-blue-500' :
                  dsar.status === 'in_review' ? 'bg-purple-500' :
                  'bg-green-500'
                }`} />
                
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <h4 className="text-xl font-bold">{dsar.requesterName}</h4>
                        <Badge variant="outline" className="ml-2 h-5 text-[10px] uppercase tracking-tighter">
                           ID: #{dsar.id}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${dsar.requesterEmail}`}>{dsar.requesterEmail}</a>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {dsar.requesterPhone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(dsar.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center justify-end">
                       <DsarStatusManager 
                         dsarId={dsar.id} 
                         currentStatus={dsar.status} 
                         companySlug={company.id.toString()}
                         requesterEmail={dsar.requesterEmail}
                       />
                    </div>
                  </div>

                  <div className="bg-muted/40 p-5 rounded-2xl border border-muted relative group-hover:bg-muted/60 transition-colors">
                    <div className="absolute -top-3 left-4 bg-background px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Submitted Instruction
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {dsar.requestText}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/20 rounded-xl">
              <div className="text-xs text-muted-foreground">
                Showing {from + 1} to {Math.min(from + pageSize, count || 0)} of {count} entries
              </div>
              <div className="flex gap-2">
                <Link href={`${baseUrl}?page=${page - 1}&status=${statusFilter || "all"}`}>
                  <Button variant="outline" size="sm" disabled={page <= 1}>
                    Previous
                  </Button>
                </Link>
                <Link href={`${baseUrl}?page=${page + 1}&status=${statusFilter || "all"}`}>
                  <Button variant="outline" size="sm" disabled={page >= totalPages}>
                    Next
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
