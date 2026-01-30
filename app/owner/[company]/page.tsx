import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { 
  Building2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  User, 
  Inbox,
  Globe,
  Briefcase,
  Clock,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  params: Promise<{ company: string }>;
}

async function CompanyProfile({ companyId }: { companyId: string }) {
  const supabase = await createClient();

  // 1. Get auth user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    redirect("/auth/login");
  }

  // 2. Get DB user
  const { data: dbUser, error: dbUserError } = await supabase
    .from("user")
    .select("id")
    .eq("email", authUser.email)
    .single();

  if (dbUserError || !dbUser) {
    redirect("/auth/login");
  }

  // 3. Fetch Company details (verify ownership)
  const { data: company, error: companyError } = await supabase
    .from("company")
    .select("*")
    .eq("id", companyId)
    .eq("ownerId", dbUser.id)
    .single();

  if (companyError || !company) {
    notFound();
  }

  // 4. Fetch DSAR requests for this company
  const { data: dsars, error: dsarError } = await supabase
    .from("dsar_request_list")
    .select("*")
    .eq("companyId", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/owner" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors w-fit group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <Building2 className="h-7 w-7" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{company.name}</h1>
              <Badge variant={company.status === "Active" ? "default" : "secondary"} className="ml-2 px-3 py-1">
                {company.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg ml-15">
              Managing compliance and privacy requests for {company.name}
            </p>
          </div>
          <div className="flex gap-3">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-blue-50 dark:border-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Representation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.representation}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-blue-50 dark:border-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" /> Public Slug
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-xl font-mono text-blue-600">{company.slug}</div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-50 dark:border-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Established
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(company.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DSAR Requests Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6 text-blue-600" />
            DSAR Submissions
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
              {dsars?.length || 0} Total
            </Badge>
          </h2>
        </div>

        {!dsars || dsars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No requests yet</h3>
            <p className="text-muted-foreground mt-1 text-center max-w-sm">
              Any Data Subject Access Requests (DSAR) submitted for this company will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {dsars.map((dsar) => (
              <Card key={dsar.id} className="overflow-hidden hover:border-blue-200 transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row shadow-sm">
                  {/* Status Sidebar */}
                  <div className={`w-2 ${dsar.status === 'open' ? 'bg-amber-400' : 'bg-green-500'}`} />
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <h4 className="text-xl font-bold">{dsar.requesterName}</h4>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            {dsar.requesterEmail}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {dsar.requesterPhone}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="text-right">
                          <Badge 
                            variant={dsar.status === 'open' ? 'outline' : 'default'}
                            className={`capitalize ${dsar.status === 'open' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'bg-green-100 text-green-700 hover:bg-green-100'}`}
                          >
                            {dsar.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            {new Date(dsar.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/40 p-5 rounded-2xl border border-muted relative group-hover:bg-muted/60 transition-colors">
                      <div className="absolute -top-3 left-4 bg-background px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Request Content
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
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { company } = await params;

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading company data...</p>
        </div>
      }>
        <CompanyProfile companyId={company} />
      </Suspense>
    </main>
  );
}
