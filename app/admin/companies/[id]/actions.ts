"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCompanyStatus(companyId: number, status: "Active" | "Rejected") {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    throw new Error("Unauthorized: Please log in.");
  }

  // 2. Verify Admin Role on the Server
  const { data: dbUser, error: dbUserError } = await supabase
    .from("user")
    .select("role")
    .eq("email", authUser.email)
    .single();

  if (dbUserError || !dbUser || dbUser.role !== "admin") {
    throw new Error("Forbidden: You do not have permission to perform this action.");
  }

  // 3. Perform the update
  const { error: updateError } = await supabase
    .from("company")
    .update({ status })
    .eq("id", companyId);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    throw new Error("Failed to update company status.");
  }

  // 4. Revalidate the path to refresh the UI
  revalidatePath("/admin");
  revalidatePath(`/admin/companies/${companyId}`);

  return { success: true };
}
