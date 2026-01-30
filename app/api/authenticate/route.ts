import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";


export async function POST() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const { data: existingUser, error: existingError } = await supabase.from("user").select("*").eq("email", data.user.email).maybeSingle();
    if (existingError) throw existingError;
    if (existingUser) {
        // Return JSON with the redirect path
        const path = existingUser.role === "admin" ? "/admin" : "/owner";
        return NextResponse.json({ success: true, redirectUrl: path });
    } 
    
    // User doesn't exist, insert them
    const { error: insertError } = await supabase.from("user").insert({
        email: data.user.email, 
        role: "owner"
    });
    
    
        if (insertError) throw insertError;
        return NextResponse.json({ success: true, redirectUrl: "/owner" });
    
}