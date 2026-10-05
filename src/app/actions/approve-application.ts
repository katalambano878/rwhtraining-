"use server";

import { createClient } from "@/lib/db";
import { createClient as createServerSupabase } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { onboardPaidStudent } from "@/lib/onboard-paid-student";
import { tierInitialAmountGhs } from "@/lib/pricing";

export async function approveApplicationAction(id: string) {
    if (!id || typeof id !== "string") {
        return { success: false, error: "Invalid application ID" };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, error: "Supabase config missing" };
    }

    const serverClient = await createServerSupabase();
    const { data: { user } } = await serverClient.auth.getUser()
        .catch(() => ({ data: { user: null } }));

    if (!user) {
        const { data: { session } } = await serverClient.auth.getSession();
        if (!session?.user) {
            return { success: false, error: "Authentication required" };
        }
        var adminUserId = session.user.id;
    } else {
        var adminUserId = user.id;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", adminUserId)
        .single();

    if (!profile || !["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
        return { success: false, error: "Unauthorized: Admin access required" };
    }

    const { data: app, error: fetchError } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !app) {
        return { success: false, error: fetchError?.message || "Application not found" };
    }

    if (app.payment_status === "PAID" && app.status === "APPROVED") {
        return { success: false, error: "Application is already approved and paid" };
    }

    // Get active cohort
    const { data: cohort } = await supabase
        .from("cohorts")
        .select("id")
        .eq("is_active", true)
        .single();

    const cohortId = cohort?.id || app.cohort_id;

    // Update application
    const { error: updateError } = await supabase
        .from("applications")
        .update({
            payment_status: "PAID",
            status: "APPROVED",
            cohort_id: cohortId,
            is_unfinished: false,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // Update or create payment record so Finance & Payments cards and ledger stay correct
    const paidAt = new Date().toISOString();
    if (app.payment_reference) {
        await supabase
            .from("payments")
            .update({
                status: "PAID",
                paid_at: paidAt,
                updated_at: paidAt,
            })
            .eq("reference", app.payment_reference);
    } else {
        // Manual approve with no payment row: create one so Total Collected and ledger update
        const manualRef = `MANUAL-${app.id}`;
        await supabase.from("payments").insert({
            reference: manualRef,
            email: app.email,
            phone: app.phone || "",
            first_name: app.first_name,
            last_name: app.last_name,
            network: "MANUAL",
            amount_ghs: app.amount_ghs ?? tierInitialAmountGhs(app.tier || "50"),
            tier: app.tier || "50",
            gateway: "manual",
            status: "PAID",
            paid_at: paidAt,
            created_at: paidAt,
            updated_at: paidAt,
        });
        await supabase
            .from("applications")
            .update({ payment_reference: manualRef, updated_at: paidAt })
            .eq("id", id);
    }

    // Run onboarding (create user, profile, enrollment, send credentials)
    if (app.email) {
        const onboardResult = await onboardPaidStudent(supabase, {
            id: app.id,
            email: app.email,
            first_name: app.first_name || "",
            last_name: app.last_name || "",
            phone: app.phone,
            city: app.city,
            amount_ghs: app.amount_ghs || 0,
            tier: app.tier,
            cohort_id: cohortId,
            user_id: app.user_id,
        });

        if (!onboardResult.ok) {
            console.error("[Approve] Onboarding partial failure:", onboardResult.error);
            revalidatePath("/admin");
            revalidatePath("/admin/applications");
            revalidatePath("/admin/students");
            return {
                success: true,
                warning: `Approved & marked paid, but onboarding had an issue: ${onboardResult.error}. The student may need manual account setup.`,
            };
        }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/drafts");
    revalidatePath("/admin/students");
    revalidatePath("/admin/payments");
    return { success: true };
}
