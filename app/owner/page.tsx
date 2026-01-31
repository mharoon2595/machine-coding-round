import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AddCompanyModal } from "@/components/add-company-modal";
import { SubscriptionsModal } from "@/components/subscriptions-modal";
import { LogoutButton } from "@/components/logout-button";
import { 
  Building2, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Inbox
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";


async function OwnerPage() {
  const supabase = await createClient();

  // Get auth user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    redirect("/auth/login");
  }


  // Get DB user 
  const { data: dbUser, error: dbUserError } = await supabase
    .from("user")
    .select("id, role")
    .eq("email", authUser.email)
    .single();

  if (dbUserError || !dbUser) {
    // If user is not in the custom user table, we might need to sync or error
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-2xl font-bold text-destructive">User profile not found</h2>
        <p className="text-muted-foreground mt-2">Please try logging in again to sync your account.</p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    );
  }

  // Role based check
  if (dbUser.role !== "owner") {
    redirect("/admin");
  }

  // Fetch only companies owned by this user
  let companies: any[] = [];
  try {
    const { data, error: companiesError } = await supabase
      .from("company")
      .select(`
        *,
        dsar_request_list(count)
      `)
      .eq("ownerId", dbUser.id)
      .order("created_at", { ascending: false });

    if (companiesError) throw companiesError;
    companies = data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
  }

  // Calculate DSAR submssions using JOIN

  const activeCompanies = companies.filter(c => ["Active", "Approved"].includes(c.status)).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Dashboard</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your companies and track their status from one central place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SubscriptionsModal companies={companies} />
          <AddCompanyModal ownerId={dbUser.id} />
          
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-100 dark:border-blue-900/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              Total Companies
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{companies.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-slate-900 dark:to-slate-950 border-green-100 dark:border-green-900/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Active Status
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{activeCompanies}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 border-indigo-100 dark:border-indigo-900/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              Account Status
            </CardDescription>
            <CardTitle className="text-3xl font-bold capitalize">{dbUser.role}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-muted-foreground" />
          Your Business Entities
        </h2>
        
        {companies.length === 0 ? (
          <Card className="border-dashed py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-xl font-medium">No companies registered yet</p>
              <p className="text-muted-foreground mt-1 max-w-xs">
                Click the "Add Company" button above to get started with your first entity.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link key={company.id} href={`/owner/${company.id}`}>
              <Card className="group hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge variant={["Active", "Approved"].includes(company.status) ? "default" : "secondary"} className={["Active", "Approved"].includes(company.status) ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                      {company.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors uppercase">
                    {company.name}
                  </CardTitle>
                  <Button asChild>
                    
                  
                  </Button>
                  <CardDescription className="flex items-center gap-1 mt-1 font-medium">
                    <Briefcase className="h-3 w-3" />
                    {company.representation}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  <div className="flex flex-col gap-2 border-t pt-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Inbox className="h-3.5 w-3.5" />
                      <span>DSAR submissions <strong>{company.dsar_request_list?.[0]?.count || 0}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Registered: {new Date(company.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OwnerPageWrapper() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      }>
        <OwnerPage />
      </Suspense>
    </main>
  );
}

