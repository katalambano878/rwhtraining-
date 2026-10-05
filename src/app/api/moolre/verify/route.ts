import { NextRequest, NextResponse } from "next/server";
import { MoolreAdapter } from "@/lib/moolre-adapter";
import { createClient } from "@/lib/db";
import { onboardPaidStudent } from "@/lib/onboard-paid-student";

/**
 * GET /api/moolre/verify?ref=RWH-xxx
 * Verifies a transaction status with Moolre and returns latest status.
 * On SUCCESS, updates Supabase and runs onboarding (auth user, profile, enrollment, credentials email).
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("ref");

    if (!reference) {
        return NextResponse.json(
            { error: "Missing 'ref' query parameter" },
            { status: 400 }
        );
    }

    try {
        const result = await MoolreAdapter.verifyTransaction(reference);

        if (result.status === "SUCCESS") {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

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
        console.error("[Moolre Verify] Error:", error);
        return NextResponse.json(
            { error: "Failed to verify transaction" },
            { status: 500 }
        );
    }
}
