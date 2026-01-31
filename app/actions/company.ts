"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { companySchema } from "@/lib/validations";

export async function createCompany(ownerId: number, formData: any) {
  const supabase = await createClient();

  // Server-side validation
  const validatedFields = companySchema.safeParse({
    ...formData,
    ownerId,
  });

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.issues.map((issue) => issue.message).join(", "));
  }

  const data = validatedFields.data;

  const { error: insertError } = await supabase.from("company").insert({
    name: data.name,
    representation: data.representation,
    slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
    status: data.status,
    ownerId: data.ownerId,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/owner");
  return { success: true };
}
