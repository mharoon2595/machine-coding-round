import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { 
  Inbox, 
  Search, 
  ArrowLeft, 
  ShieldCheck, 
  Filter,
  Download,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  User,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { DsarStatusManager } from "@/components/dsar-status-manager";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function AdminDsarContent({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;
  const statusFilter = params.status as string | undefined;
  const page = parseInt(params.page as string || "1");
  const pageSize = 10;

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/auth/login");

  const { data: dbUser } = await supabase
    .from("user")
    .select("role")
    .eq("email", authUser.email)
    .single();

  if (dbUser?.role !== "admin") redirect("/owner");

  // Fetch paginated & filtered DSARs
  let query = supabase
    .from("dsar_request_list")
    .select(`
      *,
      company:companyId (
        name,
        slug
      )
    `, { count: "exact" });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: dsars, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Global Compliance</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Master DSAR Feed</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monitor and audit privacy requests across all organizations on the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-2">
               <ArrowLeft className="h-4 w-4" /> Back to Companies
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Main Container */}
      <Card className="overflow-hidden border-blue-100 dark:border-blue-900/40">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Request Log</CardTitle>
              <CardDescription>Auditing {count || 0} total submissions.</CardDescription>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Link href="/admin/dsars?page=1&status=all">
                <Button variant={!statusFilter || statusFilter === "all" ? "default" : "outline"} size="sm" className="h-8">
                  All
                </Button>
              </Link>
              <Link href="/admin/dsars?page=1&status=open">
                <Button variant={statusFilter === "open" ? "default" : "outline"} size="sm" className="h-8">
                  Open
                </Button>
              </Link>
              <Link href="/admin/dsars?page=1&status=in_progress">
                <Button variant={statusFilter === "in_progress" ? "default" : "outline"} size="sm" className="h-8">
                  In Progress
                </Button>
              </Link>
              <Link href="/admin/dsars?page=1&status=in_review">
                <Button variant={statusFilter === "in_review" ? "default" : "outline"} size="sm" className="h-8">
                  In Review
                </Button>
              </Link>
              <Link href="/admin/dsars?page=1&status=closed">
                <Button variant={statusFilter === "closed" ? "default" : "outline"} size="sm" className="h-8">
                  Closed
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!dsars || dsars.length === 0 ? (
            <div className="p-20 text-center text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No privacy requests found matching criteria.</p>
            </div>
          ) : (
            <>
              <div className="divide-y text-sm">
                {dsars.map((dsar) => (
                  <div key={dsar.id} className="p-6 hover:bg-muted/30 transition-colors group">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                              <User className="h-5 w-5 text-blue-600" />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold">{dsar.requesterName}</h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                 <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{dsar.requesterEmail}</span>
                                 <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{dsar.requesterPhone}</span>
                              </div>
                           </div>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-xl border relative">
                           <div className="absolute -top-2.5 left-3 bg-background px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Request Content</div>
                           <p className="text-sm line-clamp-2 italic text-foreground/80">"{dsar.requestText}"</p>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                           <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                              <Building2 className="h-3.5 w-3.5" />
                              Target: <span className="text-foreground">{dsar.company?.name}</span>
                           </div>
                           <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                              <Calendar className="h-3.5 w-3.5" />
                              Submitted: <span className="text-foreground">{new Date(dsar.created_at).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>

                      <div className="lg:w-80 space-y-4">
                         <DsarStatusManager 
                           dsarId={dsar.id} 
                           currentStatus={dsar.status} 
                           requesterEmail={dsar.requesterEmail}
                         />
                         <div className="pt-4 border-t border-dashed">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1">
                               <Clock className="h-3 w-3" /> Audit Trail
                            </p>
                            <div className="flex items-center gap-2">
                               <Badge variant="outline" className="text-[10px] h-5 capitalize">{dsar.status.replace('_', ' ')}</Badge>
                               <span className="text-[10px] text-muted-foreground italic">Last modified system-side</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                  <div className="text-xs text-muted-foreground">
                    Showing {from + 1} to {Math.min(from + pageSize, count || 0)} of {count} requests
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/dsars?page=${page - 1}&status=${statusFilter || "all"}`}>
                      <Button variant="outline" size="sm" disabled={page <= 1}>
                        Previous
                      </Button>
                    </Link>
                    <Link href={`/admin/dsars?page=${page + 1}&status=${statusFilter || "all"}`}>
                      <Button variant="outline" size="sm" disabled={page >= totalPages}>
                        Next
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDsarPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Scanning privacy requests...</p>
        </div>
      }>
        <AdminDsarContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

