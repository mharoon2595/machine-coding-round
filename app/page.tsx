import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check if user exists in our DB
    const { data: dbUser } = await supabase
      .from("user")
      .select("role")
      .eq("email", user.email)
      .maybeSingle();

    if (dbUser) {
      redirect(dbUser.role === "admin" ? "/admin" : "/owner");
    } else {
      // Create profile for new user (default to owner)
      await supabase.from("user").insert({
        email: user.email,
        role: "owner"
      });
      redirect("/owner");
    }
  }

  // Not logged in, go to public portal
  redirect("/dsar");
}
