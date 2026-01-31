import { createClient } from "@/lib/supabase/server";
import { 
  Building2, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Fingerprint,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";

export default async function DsarPortalPage() {
  const supabase = await createClient();

  // Fetch all active companies
  const { data: companies, error } = await supabase
    .from("company")
    .select("*")
    .eq("status", "Active")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />
            Privacy Rights Center
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Data Subject Access Request Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exercise your privacy rights. Find a company below to submit a request for your personal data, 
            request deletion, or update your information safely and securely.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-bold">Verified Organizations</h2>
            <p className="text-muted-foreground">Select an organization to start your privacy request.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            
            
          </div>
        </div>

        {!companies || companies.length === 0 ? (
          <Card className="border-dashed py-20 text-center">
            <CardContent>
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-medium">No organizations available yet</p>
              <p className="text-muted-foreground mt-1 text-lg">Check back later for newly verified businesses.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link 
                key={company.id} 
                href={`/dsar/${company.slug}`}
                className="group block"
              >
                <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-blue-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Fingerprint className="h-12 w-12" />
                  </div>
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Building2 className="h-7 w-7 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors uppercase truncate">
                      {company.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 font-medium">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Verified
                      </Badge>
                      <span className="text-muted-foreground text-xs">{company.representation}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                      Submit Request <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t mt-20 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 font-bold text-xl text-slate-400">
          <ShieldCheck className="h-6 w-6" /> Privacy Portal
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; 2026 Secured DSAR Management System. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
