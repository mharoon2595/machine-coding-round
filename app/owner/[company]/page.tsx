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
  ExternalLink,
  Filter,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DsarStatusManager } from "@/components/dsar-status-manager";
import { DsarList } from "@/components/dsar-list";

interface Props {
  params: Promise<{ company: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function CompanyProfile({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ company: string }>,
  searchParams: Promise<any>
}) {
  const { company: companyId } = await params;
  const sParams = await searchParams;
  const statusFilter = sParams.status as string | undefined;
  const page = parseInt(sParams.page as string || "1");
  const pageSize = 5;

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

  // 4. Fetch filtered/paginated DSAR requests for this company
  let query = supabase
    .from("dsar_request_list")
    .select("*", { count: "exact" })
    .eq("companyId", company.id);

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: dsars, count, error: dsarError } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

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
              <h1 className="text-4xl font-bold tracking-tight uppercase">{company.name}</h1>
              <Badge variant={["Active", "Approved"].includes(company.status) ? "default" : "secondary"} className="ml-2 px-3 py-1">
                {company.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg ml-15">
              Compliance Control Center for {company.name}
            </p>
          </div>
          
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-sm border-blue-100 dark:border-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Company ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">#{company.id}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-100 dark:border-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Representation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{company.representation}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-blue-100 dark:border-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" /> Public Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-lg font-mono text-blue-600 truncate mr-2">{company.slug}</div>
            <Link href={`/dsar/${company.slug}`} target="_blank">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                  <ExternalLink className="h-4 w-4" />
               </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-100 dark:border-blue-900/20 bg-blue-50/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Inbox className="h-4 w-4" /> Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* DSAR Requests Section */}
      <DsarList 
        dsars={dsars || []}
        count={count || 0}
        page={page}
        pageSize={pageSize}
        statusFilter={statusFilter}
        baseUrl={`/owner/${company.id}`}
        company={company}
      />
    </div>
  );
}


export default function Page({ params, searchParams }: Props) {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading company data...</p>
        </div>
      }>
        <CompanyProfile params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

