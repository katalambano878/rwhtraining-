import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { onboardPaidStudent } from "@/lib/onboard-paid-student";

/**
 * POST /api/moolre/webhook
 * Receives payment confirmation callbacks from Moolre.
 * Updates the payment record in Supabase with the final status.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("[Moolre Webhook] Received callback:", JSON.stringify(body, null, 2));

        // Moolre sends payload with nested data: { status, message, data: { externalref, transactionid, txstatus, ... } }
        const data = body.data || body;
        const reference =
            body.reference || body.ref || body.transaction_reference
            || data.externalref || data.reference || data.ref;
        const status = body.status ?? data.txstatus ?? data.status; // 1 = success, 0 = failure
        const transactionId =
            body.transaction_id || body.id || data.transactionid || data.transaction_id;
        const amount = body.amount ?? data.amount ?? data.value;
        const message = body.message || data.message || "";

        if (!reference) {
            console.error("[Moolre Webhook] No reference found in callback body");
            return NextResponse.json(
                { error: "Missing transaction reference" },
                { status: 400 }
            );
        }

        // Determine payment status
        const paymentStatus = status === 1 || status === "1" || status === "success" || status === "SUCCESS"
            ? "PAID"
            : "FAILED";

        console.log(`[Moolre Webhook] Reference: ${reference}, Status: ${paymentStatus}`);

        // Update Supabase if configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

        if (supabaseUrl && supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            // Update the payment record
            const { error: paymentError } = await supabase
                .from("payments")
                .update({
                    status: paymentStatus,
                    moolre_transaction_id: transactionId,
                    moolre_response: body,
                    paid_at: paymentStatus === "PAID" ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString(),
                })
                .eq("reference", reference);

            if (paymentError) {
                console.error("[Moolre Webhook] Error updating payment:", paymentError);
            } else {
                console.log(`[Moolre Webhook] Payment ${reference} updated to ${paymentStatus}`);
            }

            // If payment was successful, update the application status too
            if (paymentStatus === "PAID") {
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

                if (appError || !appData) {
                    // Balance payment: look up via application_id on the payment record
                    const { data: paymentRecord } = await supabase
                        .from("payments")
                        .select("application_id")
                        .eq("reference", reference)
                        .single();

                    if (paymentRecord?.application_id) {
                        const { data: balanceApp } = await supabase
                            .from("applications")
                            .select("*")
                            .eq("id", paymentRecord.application_id)
                            .single();

                        if (balanceApp) {
                            console.log(`[Moolre Webhook] Balance payment for ${balanceApp.email}`);
                            const result = await onboardPaidStudent(supabase, {
                                id: balanceApp.id,
                                email: balanceApp.email,
                                first_name: balanceApp.first_name || "",
                                last_name: balanceApp.last_name || "",
                                phone: balanceApp.phone,
                                city: balanceApp.city,
                                amount_ghs: Number(amount) || 0,
                                tier: balanceApp.tier,
                                cohort_id: balanceApp.cohort_id,
                                user_id: balanceApp.user_id,
                            });
                            if (!result.ok) console.error("[Moolre Webhook] Balance onboarding error:", result.error);
                        }
                    } else if (appError) {
                        console.error("[Moolre Webhook] Error updating application:", appError);
                    }
                } else if (appData) {
                    console.log(`[Moolre Webhook] Setting up student portal for ${appData.email}`);
                    const result = await onboardPaidStudent(supabase, appData);
                    if (!result.ok) {
                        console.error("[Moolre Webhook] Onboarding error:", result.error);
                    }
                }
            }
        }

        // Always return 200 to Moolre so they don't retry
        return NextResponse.json({
            received: true,
            reference,
            status: paymentStatus,
            message: `Payment ${paymentStatus.toLowerCase()} for ${reference}`,
        });
    } catch (error) {
        console.error("[Moolre Webhook] Processing error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Also handle GET for simple health-check
export async function GET() {
    return NextResponse.json({
        service: "Moolre Webhook Handler",
        status: "active",
        timestamp: new Date().toISOString(),
    });
}
