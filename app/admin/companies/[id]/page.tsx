import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { 
  Building2, 
  ArrowLeft, 
  Calendar, 
  Globe, 
  Briefcase, 
  CheckCircle2, 
  XCircle,
  Clock,
  User,
  Mail,
  MessageSquare,
  ExternalLink,
  Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { CompanyActions } from "./company-actions";
import { DsarStatusManager } from "@/components/dsar-status-manager";

interface Props {
  params: Promise<{ id: string }>;
}

async function CompanyDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify Admin
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/auth/login");

  const { data: dbUser } = await supabase
    .from("user")
    .select("role")
    .eq("email", authUser.email)
    .single();

  if (dbUser?.role !== "admin") redirect("/owner");

  // Fetch Company with Owner
  const { data: company, error } = await supabase
    .from("company")
    .select(`
      *,
      owner:ownerId (
        id,
        email,
        role
      )
    `)
    .eq("id", id)
    .single();

  if (error || !company) notFound();

  const { data: dsars, error: dsarError } = await supabase
    .from("dsar_request_list")
    .select("*")
    .eq("companyId", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors w-fit group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Admin Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={["Active", "Approved"].includes(company.status) ? "default" : company.status === "Pending" ? "secondary" : "destructive"}>
                  {company.status}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Submitted on {new Date(company.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
         
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </span>
              <span className="font-medium">{company.owner?.email || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> User Role
              </span>
              <span className="font-medium capitalize">{company.owner?.role || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" /> Public Slug
              </span>
              <span className="font-medium font-mono text-blue-600">{company.slug}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Representation
              </span>
              <span className="font-medium">{company.representation}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {company.status === "Pending" && (
        <Card className="border-indigo-100 bg-indigo-50/30 dark:bg-indigo-950/20">
          <CardHeader>
            <CardTitle className="text-xl">Action Required</CardTitle>
            <CardDescription>
              This company is awaiting administrative approval before it becomes active.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyActions companyId={company.id} />
          </CardContent>
        </Card>
      )}

       {!dsars || dsars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No requests received</h3>
            <p className="text-muted-foreground mt-1 text-center max-w-sm">
              {["Active", "Approved"].includes(company.status) && company.subscriptionStatus === "active" ? "Your public [DSAR Portal Page] is active. Customers can submit requests there." : "Public [DSAR Portal Page] is not active as it is either pending admin approval or subscription is not active or both. Customers cannot submit requests there right now."}
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
                           companySlug={company.id.toString()} // using ID to revalidate
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
          </div>
        )}
    </div>
  );
}

export default function Page({ params }: Props) {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading company details...</p>
        </div>
      }>
        <CompanyDetails params={params} />
      </Suspense>
    </main>
  );
}
