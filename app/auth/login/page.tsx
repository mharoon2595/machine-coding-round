import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { Suspense } from "react";

async function AuthGate() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  // 1. If NOT logged in, show the login form
  if (error || !data?.user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    );
  }

  // 2. If logged in, check the database for their role
  const { data: existingUser, error: existingError } = await supabase
    .from("user")
    .select("*")
    .eq("email", data.user.email)
    .maybeSingle();

  if (existingError) throw existingError;

  // 3. Redirect based on role
  if (existingUser) {
    const path = existingUser.role === "admin" ? "/admin" : "/owner";
    redirect(path)
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center">
        <p>Loading session...</p>
      </div>
    }>
      <AuthGate />
    </Suspense>
  );
}