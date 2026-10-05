import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/lib/db";
import { MoolreAdapter } from "@/lib/moolre-adapter";
import { onboardPaidStudent } from "@/lib/onboard-paid-student";

/**
 * POST /api/admin/reconcile-moolre-payments
 * Verifies all PENDING Moolre payments with Moolre API and marks completed ones as PAID.
 * For payments made before the webhook was configured.
 * Requires admin session.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

        if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Server misconfiguration: missing Supabase URL or service key" }, { status: 500 });
        }

        const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey);

        // Fetch all PENDING payments (pre-webhook Moolre payments; gateway column may not exist yet)
        const { data: allPending, error: fetchError } = await serviceSupabase
            .from("payments")
            .select("id, reference, email, amount_ghs, gateway")
            .eq("status", "PENDING");

        if (fetchError) {
            console.error("[Reconcile Moolre] Fetch error:", fetchError);
            const message = fetchError.message ? `Failed to fetch payments: ${fetchError.message}` : "Failed to fetch payments";
            return NextResponse.json({ error: message }, { status: 500 });
        }

        // Only reconcile Moolre payments (gateway null/moolre; skip paystack)
        const pendingPayments = (allPending || []).filter(
            (p: { gateway?: string | null }) => !p.gateway || p.gateway === "moolre"
        );

        if (!pendingPayments.length) {
            return NextResponse.json({
                message: "No pending Moolre payments to reconcile.",
                processed: 0,
                updated: 0,
                failed: 0,
            });
        }

        const results = { processed: 0, updated: 0, failed: 0, errors: [] as string[] };

        for (const payment of pendingPayments) {
            results.processed++;
            try {
                const verify = await MoolreAdapter.verifyTransaction(payment.reference);

                if (verify.status !== "SUCCESS") {
                    results.failed++;
                    continue;
                }

                await serviceSupabase
                    .from("payments")
                    .update({
                        status: "PAID",
                        paid_at: new Date().toISOString(),
                        moolre_response: verify.data,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("reference", payment.reference);

                const { data: appData, error: appError } = await serviceSupabase
                    .from("applications")
                    .update({
                        payment_status: "PAID",
                        status: "APPROVED",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("payment_reference", payment.reference)
                    .select()
                    .single();

                if (appError) {
                    results.errors.push(`${payment.reference}: app update failed`);
                } else if (appData) {
                    await onboardPaidStudent(serviceSupabase, appData);
                }

                results.updated++;
            } catch (err) {
                results.failed++;
                results.errors.push(`${payment.reference}: ${String(err)}`);
            }
        }

        return NextResponse.json({
            message: `Reconciled ${results.updated} of ${results.processed} pending payments.`,
            processed: results.processed,
            updated: results.updated,
            failed: results.failed,
            errors: results.errors.length ? results.errors : undefined,
        });
    } catch (error) {
        console.error("[Reconcile] Error:", error);
        return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
    }
}
