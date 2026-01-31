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
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { CompanyActions } from "./company-actions";

interface Props {
  params: Promise<{ id: string }>;
}

async function CompanyDetails({ id }: { id: string }) {
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
                <Badge variant={company.status === "Active" ? "default" : company.status === "Pending" ? "secondary" : "destructive"}>
                  {company.status}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Submitted on {new Date(company.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <LogoutButton />
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
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading company details...</p>
        </div>
      }>
        <CompanyDetails id={id} />
      </Suspense>
    </main>
  );
}
