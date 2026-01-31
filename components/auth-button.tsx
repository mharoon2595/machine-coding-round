import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;
  
  const {data: userProfile} = await supabase.from("user").select("*").eq("email", user?.email).single();

  let redirectButton;

  if(userProfile && userProfile.role === "admin") {
    redirectButton = <Button asChild size="sm" variant={"default"}>
      <Link href="/admin">View Dashboard</Link>
    </Button>
  } else if(userProfile && userProfile.role === "owner") {
    redirectButton = <Button asChild size="sm" variant={"default"}>
      <Link href="/owner">View Dashboard</Link>
    </Button>
  }

  return user ? (
    <div className="flex items-center justify-end gap-4 p-5">
      Hey, {user.email}!
      {redirectButton}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2 justify-end p-5">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
