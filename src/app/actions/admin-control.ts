"use server";

import { createClient } from "@/lib/db";
import { createClient as createServerSupabase } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { onboardPaidStudent } from "@/lib/onboard-paid-student";
import { COURSE_TOTAL_GHS, tierInitialAmountGhs } from "@/lib/pricing";

async function getServiceAndAdminId(): Promise<{
    supabase: any;
    adminId: string | null;
    error?: string;
}> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        return { supabase: null as any, adminId: null, error: "Supabase config missing" };
    }
    const serverClient = await createServerSupabase();
    const { data: { user } } = await serverClient.auth.getUser().catch(() => ({ data: { user: null } }));
    const sessionUser = user ?? (await serverClient.auth.getSession()).data.session?.user;
    if (!sessionUser) {
        return { supabase: null as any, adminId: null, error: "Authentication required" };
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", sessionUser.id).single();
    if (!profile || !["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
        return { supabase: null as any, adminId: null, error: "Unauthorized" };
    }
    return { supabase, adminId: sessionUser.id };
}

function revalidateAdmin() {
    revalidatePath("/admin");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/students");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/drafts");
    revalidatePath("/admin/settings");
}

// --- Cohorts ---

export async function updateCohortAction(
    cohortId: string,
    fields: { name?: string; start_date?: string; capacity?: number; is_active?: boolean }
) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const { error: e } = await supabase
        .from("cohorts")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", cohortId);
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

export async function createCohortAction(input: { name: string; start_date: string; capacity: number }) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const { error: e } = await supabase.from("cohorts").insert({
        name: input.name.trim(),
        start_date: input.start_date,
        capacity: Math.max(1, Math.min(500, Number(input.capacity) || 10)),
        is_active: false,
    });
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

export async function setActiveCohortAction(cohortId: string) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    await supabase.from("cohorts").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    const { error: e } = await supabase.from("cohorts").update({ is_active: true }).eq("id", cohortId);
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

// --- Application status & edits ---

export async function setApplicationStatusAction(applicationId: string, status: "REJECTED" | "WAITLISTED" | "PENDING_REVIEW") {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const { error: e } = await supabase
        .from("applications")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", applicationId);
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

/** Mark PAID + APPROVED + payment row; does NOT create student account */
export async function markApplicationPaidNoOnboardAction(applicationId: string) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const { data: app, error: fe } = await supabase.from("applications").select("*").eq("id", applicationId).single();
    if (fe || !app) return { success: false, error: "Application not found" };
    const paidAt = new Date().toISOString();
    await supabase
        .from("applications")
        .update({
            payment_status: "PAID",
            status: "APPROVED",
            is_unfinished: false,
            updated_at: paidAt,
        })
        .eq("id", applicationId);
    const ref = `PAID-NO-ONBOARD-${applicationId.slice(0, 8)}-${Date.now()}`;
    await supabase.from("payments").insert({
        reference: ref,
        email: app.email,
        phone: app.phone || "",
        first_name: app.first_name,
        last_name: app.last_name,
        network: "MANUAL",
        amount_ghs: app.amount_ghs ?? tierInitialAmountGhs(app.tier || "50"),
        tier: app.tier || "50",
        gateway: "manual",
        payment_type: "mark_paid_only",
        application_id: app.id,
        status: "PAID",
        paid_at: paidAt,
        created_at: paidAt,
        updated_at: paidAt,
    });
    revalidateAdmin();
    return { success: true };
}

export async function updateApplicationFieldsAction(
    applicationId: string,
    fields: { first_name?: string; last_name?: string; email?: string; phone?: string; city?: string }
) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const clean: Record<string, string> = {};
    if (fields.first_name != null) clean.first_name = fields.first_name.trim();
    if (fields.last_name != null) clean.last_name = fields.last_name.trim();
    if (fields.email != null) clean.email = fields.email.trim().toLowerCase();
    if (fields.phone != null) clean.phone = fields.phone.trim();
    if (fields.city != null) clean.city = fields.city.trim();
    if (Object.keys(clean).length === 0) return { success: false, error: "No fields to update" };
    clean.updated_at = new Date().toISOString();
    const { error: e } = await supabase.from("applications").update(clean).eq("id", applicationId);
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

// --- Enrollment ---

export async function updateEnrollmentFinancialsAction(enrollmentId: string, total_paid: number, balance_due: number) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const tp = Math.max(0, Number(total_paid));
    const bd = Math.max(0, Number(balance_due));
    const { error: e } = await supabase
        .from("enrollments")
        .update({ total_paid: tp, balance_due: bd, updated_at: new Date().toISOString() })
        .eq("id", enrollmentId);
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

export async function setEnrollmentActiveAction(enrollmentId: string, is_active: boolean) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const { error: e } = await supabase
        .from("enrollments")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", enrollmentId);
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

// --- Admin users ---

async function findAuthUserByEmail(supabase: ReturnType<typeof createClient>, email: string) {
    const target = email.trim().toLowerCase();
    let page = 1;
    for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
        const u = data?.users?.find((x: { email?: string | null }) => x.email?.toLowerCase() === target);
        if (u) return u;
        if (!data?.users?.length) break;
        page++;
    }
    return null;
}

export async function promoteToAdminAction(email: string) {
    const { supabase, adminId, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const user = await findAuthUserByEmail(supabase, email);
    if (!user) return { success: false, error: "No account found with that email. They must sign up first." };
    const { data: prof } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
    if (!prof) return { success: false, error: "Profile missing for this user" };
    if (prof.role === "ADMIN" || prof.role === "SUPER_ADMIN") {
        return { success: false, error: "User is already an admin" };
    }
    const { error: e } = await supabase.from("profiles").update({ role: "ADMIN", updated_at: new Date().toISOString() }).eq("id", user.id);
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

export async function demoteFromAdminAction(profileId: string) {
    const { supabase, adminId, error } = await getServiceAndAdminId();
    if (error || !supabase || !adminId) return { success: false, error: error || "Unauthorized" };
    if (profileId === adminId) {
        const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true }).in("role", ["ADMIN", "SUPER_ADMIN"]);
        if ((count ?? 0) <= 1) return { success: false, error: "Cannot demote yourself as the only admin" };
    }
    const { data: target } = await supabase.from("profiles").select("role").eq("id", profileId).single();
    if (!target || (target.role !== "ADMIN" && target.role !== "SUPER_ADMIN")) {
        return { success: false, error: "Target is not an admin" };
    }
    const { count: adminCount } = await supabase.from("profiles").select("id", { count: "exact", head: true }).in("role", ["ADMIN", "SUPER_ADMIN"]);
    if ((adminCount ?? 0) <= 1) return { success: false, error: "Cannot remove the last admin" };
    const { error: e } = await supabase.from("profiles").update({ role: "STUDENT", updated_at: new Date().toISOString() }).eq("id", profileId);
    if (e) return { success: false, error: e.message };
    revalidateAdmin();
    return { success: true };
}

// --- Password reset link ---

export async function adminGeneratePasswordResetLinkAction(email: string) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const { data, error: e } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: email.trim().toLowerCase(),
    });
    if (e || !data?.properties?.action_link) return { success: false, error: e?.message || "Could not generate link" };
    return { success: true, action_link: data.properties.action_link };
}

// --- Walk-in enrollment ---

export async function manualEnrollStudentAction(input: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city?: string;
    tier: string;
    amount_ghs: number;
}) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const { data: cohort } = await supabase.from("cohorts").select("id").eq("is_active", true).single();
    if (!cohort?.id) return { success: false, error: "No active cohort. Set one in Settings first." };
    const email = input.email.trim().toLowerCase();
    const amount = Math.max(0, Math.min(COURSE_TOTAL_GHS, Number(input.amount_ghs) || 0));
    const paidAt = new Date().toISOString();
    const { data: app, error: appErr } = await supabase
        .from("applications")
        .insert({
            first_name: input.first_name.trim(),
            last_name: input.last_name.trim(),
            email,
            phone: input.phone.trim(),
            city: input.city?.trim() || null,
            tier: input.tier || "50",
            amount_ghs: amount,
            payment_status: "PAID",
            status: "APPROVED",
            cohort_id: cohort.id,
            is_unfinished: false,
            updated_at: paidAt,
        })
        .select("id")
        .single();
    if (appErr || !app) return { success: false, error: appErr?.message || "Failed to create application" };
    const ref = `WALKIN-${app.id.slice(0, 8)}-${Date.now()}`;
    await supabase.from("payments").insert({
        reference: ref,
        email,
        phone: input.phone.trim(),
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        network: "CASH",
        amount_ghs: amount,
        tier: input.tier || "50",
        gateway: "manual",
        payment_type: "walk_in",
        application_id: app.id,
        status: "PAID",
        paid_at: paidAt,
        created_at: paidAt,
        updated_at: paidAt,
    });
    const onboard = await onboardPaidStudent(supabase, {
        id: app.id,
        email,
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        phone: input.phone,
        city: input.city,
        amount_ghs: amount,
        tier: input.tier,
        cohort_id: cohort.id,
        user_id: null,
    });
    if (!onboard.ok) {
        return { success: false, error: onboard.error || "Onboarding failed", application_id: app.id };
    }
    revalidateAdmin();
    return { success: true };
}

// --- Reconcile enrollment financials from payments (fixes double-counted data) ---

export async function reconcileEnrollmentFinancialsAction() {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };

    const { data: enrollments, error: eErr } = await supabase
        .from("enrollments")
        .select("id, application_id, total_paid, balance_due");
    if (eErr || !enrollments) return { success: false, error: eErr?.message || "Failed to fetch enrollments" };

    let fixed = 0;
    let checked = 0;

    for (const enrollment of enrollments) {
        checked++;
        const appId = enrollment.application_id;
        if (!appId) continue;

        const paymentsMap = new Map<string, number>();

        const { data: byAppId } = await supabase
            .from("payments")
            .select("id, amount_ghs")
            .eq("application_id", appId)
            .in("status", ["PAID", "SUCCESS"]);

        if (byAppId) {
            for (const p of byAppId) {
                paymentsMap.set(p.id, Number(p.amount_ghs || 0));
            }
        }

        const { data: app } = await supabase
            .from("applications")
            .select("payment_reference")
            .eq("id", appId)
            .single();

        if (app?.payment_reference) {
            const { data: refPayment } = await supabase
                .from("payments")
                .select("id, amount_ghs")
                .eq("reference", app.payment_reference)
                .in("status", ["PAID", "SUCCESS"])
                .maybeSingle();

            if (refPayment) {
                paymentsMap.set(refPayment.id, Number(refPayment.amount_ghs || 0));
            }
        }

        const actualPaid = Array.from(paymentsMap.values()).reduce((sum, v) => sum + v, 0);
        const correctBalance = Math.max(0, COURSE_TOTAL_GHS - actualPaid);

        if (
            actualPaid !== Number(enrollment.total_paid) ||
            correctBalance !== Number(enrollment.balance_due)
        ) {
            await supabase.from("enrollments").update({
                total_paid: actualPaid,
                balance_due: correctBalance,
                updated_at: new Date().toISOString(),
            }).eq("id", enrollment.id);
            fixed++;
            console.log(`[Reconcile] Fixed enrollment ${enrollment.id}: was paid=${enrollment.total_paid}/due=${enrollment.balance_due}, now paid=${actualPaid}/due=${correctBalance}`);
        }
    }

    revalidateAdmin();
    return { success: true, checked, fixed };
}

// --- Void manual / cash payment ---

export async function voidManualPaymentAction(paymentId: string) {
    const { supabase, error } = await getServiceAndAdminId();
    if (error || !supabase) return { success: false, error: error || "Unauthorized" };
    const { data: p, error: fe } = await supabase.from("payments").select("*").eq("id", paymentId).single();
    if (fe || !p) return { success: false, error: "Payment not found" };
    if (p.status !== "PAID" && p.status !== "SUCCESS") return { success: false, error: "Only paid payments can be voided" };
    const isVoidable =
        p.network === "CASH" ||
        p.payment_type === "manual" ||
        p.payment_type === "walk_in" ||
        (p.gateway === "manual" && p.payment_type === "mark_paid_only");
    if (!isVoidable) return { success: false, error: "Only manual / cash / walk-in payments can be voided from here" };
    const appId = p.application_id as string | null;
    if (!appId) return { success: false, error: "Payment has no linked application" };
    const { data: en } = await supabase.from("enrollments").select("id, total_paid, balance_due").eq("application_id", appId).single();
    if (en) {
        const amt = Number(p.amount_ghs || 0);
        const newPaid = Math.max(0, Number(en.total_paid) - amt);
        const newBal = Math.min(COURSE_TOTAL_GHS, Number(en.balance_due) + amt);
        await supabase
            .from("enrollments")
            .update({ total_paid: newPaid, balance_due: newBal, updated_at: new Date().toISOString() })
            .eq("id", en.id);
    }
    await supabase.from("payments").update({ status: "REVERSED", updated_at: new Date().toISOString() }).eq("id", paymentId);
    revalidateAdmin();
    return { success: true };
}
