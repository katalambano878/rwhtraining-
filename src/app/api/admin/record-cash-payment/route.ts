import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/lib/db";

/**
 * POST /api/admin/record-cash-payment
 * Record a manual (e.g. cash) payment for a student. Updates enrollment and inserts a payment row.
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

        const body = await request.json();
        const enrollmentId = body.enrollment_id as string | undefined;
        const amountGhs = typeof body.amount_ghs === "number" ? body.amount_ghs : Number(body.amount_ghs);
        if (!enrollmentId) {
            return NextResponse.json({ error: "enrollment_id is required" }, { status: 400 });
        }
        if (!Number.isFinite(amountGhs) || amountGhs <= 0) {
            return NextResponse.json({ error: "amount_ghs must be a positive number" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Server misconfiguration: missing Supabase credentials" }, { status: 500 });
        }

        const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey);

        const { data: enrollment, error: enrollError } = await serviceSupabase
            .from("enrollments")
            .select("id, application_id, total_paid, balance_due")
            .eq("id", enrollmentId)
            .single();

        if (enrollError || !enrollment) {
            return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
        }

        const { data: application, error: appError } = await serviceSupabase
            .from("applications")
            .select("id, email, phone, first_name, last_name, tier")
            .eq("id", enrollment.application_id)
            .single();

        if (appError || !application) {
            return NextResponse.json({ error: "Application not found for this enrollment" }, { status: 404 });
        }

        const currentBalance = Number(enrollment.balance_due ?? 0);
        const newTotalPaid = Number(enrollment.total_paid ?? 0) + amountGhs;
        const newBalanceDue = Math.max(0, currentBalance - amountGhs);

        const reference = `CASH-${Date.now()}-${enrollment.id.slice(0, 8)}`;
        const now = new Date().toISOString();

        const { error: payError } = await serviceSupabase.from("payments").insert({
            reference,
            email: application.email,
            phone: application.phone || "",
            first_name: application.first_name ?? undefined,
            last_name: application.last_name ?? undefined,
            network: "CASH",
            amount_ghs: amountGhs,
            tier: application.tier || "50",
            gateway: "manual",
            payment_type: "manual",
            application_id: application.id,
            status: "PAID",
            paid_at: now,
            created_at: now,
            updated_at: now,
        });

        if (payError) {
            if (payError.code === "23505") {
                return NextResponse.json({ error: "Duplicate reference; please try again." }, { status: 409 });
            }
            console.error("[Record cash payment] Insert payment error:", payError);
            return NextResponse.json({ error: payError.message }, { status: 500 });
        }

        const { error: updateError } = await serviceSupabase
            .from("enrollments")
            .update({
                total_paid: newTotalPaid,
                balance_due: newBalanceDue,
                updated_at: now,
            })
            .eq("id", enrollmentId);

        if (updateError) {
            console.error("[Record cash payment] Update enrollment error:", updateError);
            return NextResponse.json({ error: "Payment recorded but enrollment update failed" }, { status: 500 });
        }

        return NextResponse.json({
            ok: true,
            enrollment_id: enrollmentId,
            amount_ghs: amountGhs,
            new_total_paid: newTotalPaid,
            new_balance_due: newBalanceDue,
        });
    } catch (error) {
        console.error("[Record cash payment] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
