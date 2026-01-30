import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AdminContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  let companies = [];

  try{
  const { data, error: companiesError } = (await supabase.from("company").select("*"));

    if (companiesError) throw companiesError;
    companies = data || [];
 
  } catch (error) {
    console.error("Error fetching companies:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Companies</h2>
        {companies.length === 0 ? (
          <p className="text-muted-foreground">No companies found.</p>
        ) : (
          <div className="grid gap-4">
            {companies.map((company) => (
              <div key={company.id} className="p-4 border rounded-lg shadow-sm bg-card">
                <h3 className="font-bold text-lg">{company.name}</h3>
                <p className="text-sm text-muted-foreground">Owner: {company.owner?.email || "N/A"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="p-8">
      <Suspense fallback={<p>Authenticating...</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}