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

  return (
    <div>
      <h1>Admin Page</h1>
      <p>Welcome, {data.user.email}</p>
      <LogoutButton/>
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