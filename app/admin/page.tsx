import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function AdminContent() {
  const supabase = await createClient();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/auth/login");
  }

  // Double check admin role
  const { data: dbUser } = await supabase
    .from("user")
    .select("role")
    .eq("email", authUser.email)
    .single();

  if (dbUser?.role !== "admin") {
    redirect("/owner");
  }

  let companies: any[] = [];

  try {
    const { data, error: companiesError } = await supabase
      .from("company")
      .select(`
        *,
        owner:ownerId (
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (companiesError) throw companiesError;
    companies = data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
  }

  const pendingCount = companies.filter(c => c.status === "Pending").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Administration</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Review and manage company submissions and platform activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/dsars">
            <Button variant="outline" className="gap-2 border-blue-200 text-blue-700">
               <ShieldCheck className="h-4 w-4" /> Global DSAR Feed
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-indigo-100 dark:border-indigo-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-500 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Total Entities
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{companies.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-100 dark:border-amber-900/50 bg-amber-50/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Pending Approval
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-green-100 dark:border-green-900/50 bg-green-50/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Active Entities
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{companies.filter(c => ["Active", "Approved"].includes(c.status)).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-red-100 dark:border-red-900/50 bg-red-50/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-500 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Rejected
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{companies.filter(c => c.status === "Rejected").length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Table Content */}
      <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/40">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Submission Log</CardTitle>
              <CardDescription>Comprehensive list of all registered business entities.</CardDescription>
            </div>
            
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {companies.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No company submissions found in the database.
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 transition-colors">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Submitted</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {companies.map((company) => (
                    <tr 
                      key={company.id} 
                      className={`border-b transition-colors hover:bg-muted/30 group ${company.status === 'Pending' ? 'bg-indigo-50/10 dark:bg-indigo-900/5' : ''}`}
                    >
                      <td className="p-4 align-middle">
                        <div className="font-bold flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {company.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{company.slug}</div>
                      </td>
                      <td className="p-4 align-middle font-medium">{company.owner?.email || "N/A"}</td>
                      <td className="p-4 align-middle text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(company.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge 
                          variant={["Active", "Approved"].includes(company.status) ? "default" : company.status === "Pending" ? "secondary" : "destructive"}
                          className={`
                            ${company.status === 'Pending' ? 'animate-pulse bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : ''}
                            ${["Active", "Approved"].includes(company.status) ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : ''}
                          `}
                        >
                          {company.status}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right px-6">
                        <Button asChild variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                          <Link href={`/admin/companies/${company.id}`} className="gap-2">
                            View Details <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
        </div>
      }>
        <AdminContent />
      </Suspense>
    </main>
  );
}
