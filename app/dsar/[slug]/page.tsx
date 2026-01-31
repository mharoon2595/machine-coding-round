import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { 
  Building2, 
  ArrowLeft, 
  Globe, 
  ShieldCheck, 
  Clock, 
  Briefcase,
  FileText,
  Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DsarForm } from "@/components/dsar-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicCompanyPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch company by slug
  const { data: company, error } = await supabase
    .from("company")
    .select("*")
    .eq("slug", slug)
    .eq("status", "Approved")
    .single();

  const subscriptionStatus = company?.subscriptionStatus === "active";

  if (error || !company) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/dsar" 
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Portal Directory
          </Link>
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-5 w-5 text-blue-600" />
             <span className="text-sm font-bold tracking-tight hidden sm:block">Privacy Rights Verification</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Company Identity */}
        <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16 animate-in fade-in duration-700">
          <div className="h-24 w-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
            <Building2 className="h-12 w-12" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-extrabold tracking-tight uppercase">{company.name}</h1>
              <Badge className="bg-green-100 text-green-700 border-green-200">Verified Partner</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
               <div className="flex items-center gap-2 text-muted-foreground bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>Representation: <strong>{company.representation}</strong></span>
               </div>
               <div className="flex items-center gap-2 text-muted-foreground bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border text-sm">
                  <Globe className="h-4 w-4" />
                  <span>Public ID: <strong>{company.slug}</strong></span>
               </div>
            </div>
          </div>
        </div>

        {/* Informational Section */}
        <div className="grid gap-10 md:grid-cols-5 mb-16">
          <div className="md:col-span-3 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" /> Information for Data Subjects
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                By submitting a request through this portal, {company.name} will be notified of your request 
                to exercise your privacy rights under applicable data protection laws. 
              </p>
            </div>
            <div className="grid gap-4">
              {[
                { title: "Transparency", desc: "Know exactly what data is being collected and how it's used." },
                { title: "Control", desc: "Request deletion or correction of your personal information." },
                { title: "Security", desc: "Your request is handled through our secure, encrypted channel." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-xl">
               <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Lock className="h-5 w-5" />
               </div>
               <h3 className="text-xl font-bold">Standard Processing Times</h3>
               <p className="text-sm text-slate-300">
                 Requests are usually acknowledged within 48 hours and resolved within 30 calendar days. Some complex requests may take longer as permitted by law.
               </p>
               <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Clock className="h-4 w-4" /> ESTABLISHED {new Date(company.created_at).getFullYear()}
               </div>
            </div>
          </div>
        </div>

        {/* The Form */}
        {
          subscriptionStatus && (
          <div id="request-form">
          <DsarForm 
            companyId={company.id} 
            ownerId={company.ownerId} 
            companyName={company.name} 
          />
        </div>
         )}
      </main>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
