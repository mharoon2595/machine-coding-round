"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function createCheckoutSession(companyId: number, companyName: string) {
  const supabase = await createClient();

  // 1. Verify Auth
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Unauthorized");

  // 2. Get the origin for success/cancel URLs
  const origin = (await headers()).get("origin");

  try {
    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `DSAR Portal Subscription - ${companyName}`,
              description: `Monthly subscription for privacy compliance management.`,
            },
            unit_amount: 2900, // £29.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/owner?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/owner?canceled=true`,
      metadata: {
        companyId: companyId.toString(),
        ownerEmail: authUser.email!,
      },
      customer_email: authUser.email,
    });

    return { url: session.url };
  } catch (error: any) {
    console.error("Stripe Session Error:", error);
    throw new Error(error.message || "Failed to create checkout session");
  }
}
