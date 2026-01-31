import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";




export async function POST(req: NextRequest) {
  console.log(">>> Stripe Webhook Received");
 
  // Supabase Service Role Key for administrative updates in webhooks which bypasses RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  console.log(">>> Signature:", signature ? "Present" : "Missing");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`>>> Webhook Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const session = event.data.object as any;
  console.log(">>> Event Type:", event.type);

  // Handle specific event types
  switch (event.type) {
    case "checkout.session.completed":
      const companyId = session.metadata?.companyId;
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription;

      console.log(">>> Processing checkout.session.completed for company:", companyId);

      if (companyId) {
        const { error } = await supabaseAdmin
          .from("company")
          .update({
            stripeCustomerId,
            stripeSubscriptionId,
            subscriptionStatus: "active",
          })
          .eq("id", companyId);

        if (error) {
          console.error(`>>> Error updating company ${companyId}:`, error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
        
        console.log(`>>> Successfully updated company ${companyId} with Stripe IDs.`);
      }
      break;

    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = event.data.object as any;
      console.log(">>> Processing subscription change:", subscription.id, "Status:", subscription.status);

      const { error: syncError } = await supabaseAdmin
        .from("company")
        .update({
          subscriptionStatus: subscription.status,
        })
        .eq("stripeSubscriptionId", subscription.id);

      if (syncError) {
        console.error(`>>> Error syncing subscription ${subscription.id}:`, syncError);
      }
      break;

    default:
      console.log(`>>> Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

