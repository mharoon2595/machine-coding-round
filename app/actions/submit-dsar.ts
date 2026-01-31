"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { dsarRequestSchema } from "@/lib/validations";

export async function submitDsarRequest(formData: {
  companyId: number;
  ownerId: number;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requestText: string;
}) {
  // Server-side validation
  const validatedFields = dsarRequestSchema.safeParse(formData);

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.issues.map((issue) => issue.message).join(", "));
  }

  const supabase = await createClient();

  const { error } = await supabase.from("dsar_request_list").insert({
    companyId: formData.companyId,
    user_id: formData.ownerId,
    requesterName: formData.requesterName,
    requesterEmail: formData.requesterEmail,
    requesterPhone: formData.requesterPhone,
    requestText: formData.requestText,
    status: "open",
  });

  if (error) {
    console.error("DSAR Submission Error:", error);
    throw new Error("Failed to submit request: " + error.message);
  }

  revalidatePath(`/dsar/${formData.companyId}`);
  return { success: true };
}

export async function updateDsarStatus(dsarId: number, status: string, companySlug?: string) {
  const supabase = await createClient();

  // 1. Verify Authentication
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) throw new Error("Unauthorized");

  // 2. Fetch User to verify Admin or Owner
  const { data: dbUser } = await supabase
    .from("user")
    .select("id, role")
    .eq("email", authUser.email)
    .single();

  if (!dbUser) throw new Error("User Profile Not Found");

  // 3. Update Status
  const { error } = await supabase
    .from("dsar_request_list")
    .update({ status })
    .eq("id", dsarId);

  if (error) throw error;

  // 4. Revalidate paths
  revalidatePath("/admin/dsars");
  if (companySlug) {
    revalidatePath(`/owner/${companySlug}`);
  }

  return { success: true };
}
