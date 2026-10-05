import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { MoolreAdapter } from "@/lib/moolre-adapter";
import { PaystackAdapter } from "@/lib/paystack-adapter";
import { onboardPaidStudent } from "@/lib/onboard-paid-student";

/**
 * GET /api/payments/verify?ref=RWH-xxx
 * Verifies payment status with the correct gateway (Moolre or Paystack).
 * On SUCCESS, updates Supabase and runs onboarding.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("ref");

    if (!reference) {
        return NextResponse.json({ error: "Missing 'ref' query parameter" }, { status: 400 });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

        let gateway = "moolre";
        if (supabaseUrl && supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            const { data: payment } = await supabase
                .from("payments")
                .select("gateway")
                .eq("reference", reference)
                .single();
            if (payment?.gateway) {
                gateway = payment.gateway;
            }
        }

        let result;
        if (gateway === "paystack") {
            result = await PaystackAdapter.verifyTransaction(reference);
        } else {
            result = await MoolreAdapter.verifyTransaction(reference);
        }

        if (result.status === "SUCCESS") {
            if (supabaseUrl && supabaseServiceKey) {
                const supabase = createClient(supabaseUrl, supabaseServiceKey);

                await supabase
                    .from("payments")
                    .update({
                        status: "PAID",
                        paid_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq("reference", reference);

                const { data: appData } = await supabase
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
                    await onboardPaidStudent(supabase, appData);
                }
            }
        }

        return NextResponse.json({
            reference,
            status: result.status,
            message: result.message,
        });
    } catch (error) {
        console.error("[Payments Verify] Error:", error);
        return NextResponse.json({ error: "Failed to verify transaction" }, { status: 500 });
    }
}
