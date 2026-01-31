import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { cookies } from "next/headers";


export const dynamic = "force-dynamic";

export async function AuthButton() {
  await cookies(); // Ensure dynamic rendering
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  let userProfile = null;
  if (user) {
    const { data } = await supabase.from("user")
      .select("*")
      .eq("email", user.email)
      .single();
    userProfile = data;
  }

  let redirectButton = null;

  if (userProfile?.role === "admin") {
    redirectButton = (
      <Button asChild variant="default">
        <Link href="/admin">View Dashboard</Link>
      </Button>
    );
  } else if (userProfile?.role === "owner") {
    redirectButton = (
      <Button asChild variant="default">
        <Link href="/owner">View Dashboard</Link>
      </Button>
    );
  }

  return user ? (
    <div className="flex items-center justify-between gap-4 p-5">
      <Link href="/">DSAR Portal</Link>
      <div className="flex flex-wrap gap-2 items-center justify-end">
      Hey, {user.email}!
      {redirectButton}
      <LogoutButton />
      </div>
    </div>
  ) : (
    <div className="flex flex-wrap gap-2 justify-between p-5">
      <Link href="/">DSAR Portal</Link>
      <div className="flex gap-2 items-center">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
      </div>
    </div>
  );
}
