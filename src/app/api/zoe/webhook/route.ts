import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { verifyZoeSignature } from "@/lib/zoe-pay";
import { onboardPaidStudent } from "@/lib/onboard-paid-student";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ZoeWebhookEvent {
  event?: string;
  reference?: string;
  clientReference?: string;
  status?: string;
  environment?: string;
  amount?: { base?: number; fee?: number; total?: number };
  paidAt?: string | null;
}

/**
 * POST /api/zoe/webhook
 * Zoe Pay webhook. The signature is checked before the body is trusted.
 * On payment.succeeded the payment record is marked PAID, the application
 * is approved, and the student portal is set up (same path as polling).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.ZOE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const valid = verifyZoeSignature(
    payload,
    request.headers.get("x-zoe-signature"),
    secret,
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: ZoeWebhookEvent;
  try {
    event = JSON.parse(payload) as ZoeWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reference = event.clientReference;
  if (!reference) {
    return NextResponse.json({ received: true, processed: false });
  }

  const isSuccess = event.event === "payment.succeeded" || event.status === "success";
  const isFailure =
    event.event === "payment.failed" ||
    event.event === "payment.cancelled" ||
    event.status === "failed" ||
    event.status === "cancelled" ||
    event.status === "expired";

  console.log(`[Zoe Webhook] ${event.event} for ${reference} (${event.environment})`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey || (!isSuccess && !isFailure)) {
    return NextResponse.json({ received: true, processed: false });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (isFailure) {
      // Never downgrade a payment that already settled.
      await supabase
        .from("payments")
        .update({ status: "FAILED", updated_at: new Date().toISOString() })
        .eq("reference", reference)
        .neq("status", "PAID");
      return NextResponse.json({ received: true, processed: true, status: "FAILED" });
    }

    // Success path
    await supabase
      .from("payments")
      .update({
        status: "PAID",
        zoe_reference: event.reference || null,
        zoe_response: event,
        paid_at: event.paidAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("reference", reference);

    const { data: appData, error: appError } = await supabase
      .from("applications")
      .update({
        payment_status: "PAID",
        status: "APPROVED",
        updated_at: new Date().toISOString(),
      })
      .eq("payment_reference", reference)
      .select()
      .single();

    if (appData) {
      const result = await onboardPaidStudent(supabase, appData);
      if (!result.ok) {
        console.error("[Zoe Webhook] Onboarding error:", result.error);
      }
    } else {
      // Balance payment: look up via application_id on the payment record.
      const { data: paymentRecord } = await supabase
        .from("payments")
        .select("application_id, amount_ghs")
        .eq("reference", reference)
        .single();

      if (paymentRecord?.application_id) {
        const { data: balanceApp } = await supabase
          .from("applications")
          .select("*")
          .eq("id", paymentRecord.application_id)
          .single();

        if (balanceApp) {
          console.log(`[Zoe Webhook] Balance payment for ${balanceApp.email}`);
          const result = await onboardPaidStudent(supabase, {
            id: balanceApp.id,
            email: balanceApp.email,
            first_name: balanceApp.first_name || "",
            last_name: balanceApp.last_name || "",
            phone: balanceApp.phone,
            city: balanceApp.city,
            amount_ghs: Number(event.amount?.base ?? paymentRecord.amount_ghs) || 0,
            tier: balanceApp.tier,
            cohort_id: balanceApp.cohort_id,
            user_id: balanceApp.user_id,
          });
          if (!result.ok) {
            console.error("[Zoe Webhook] Balance onboarding error:", result.error);
          }
        }
      } else if (appError) {
        console.error("[Zoe Webhook] Error updating application:", appError);
      }
    }

    return NextResponse.json({ received: true, processed: true, status: "PAID" });
  } catch (error) {
    console.error("[Zoe Webhook] Processing error:", error);
    // 500 so Zoe retries the delivery.
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    service: "Zoe Pay Webhook Handler",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
