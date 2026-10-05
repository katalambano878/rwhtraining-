type SupabaseClient = ReturnType<typeof import("@/lib/db").createClient>;
import { COURSE_TOTAL_GHS } from "@/lib/pricing";
import { sendEmail } from "@/lib/send-email";
import { SmsAdapter } from "@/lib/sms-adapter";
import { EMAIL_TEMPLATES, SMS_TEMPLATES, COHORT_WHATSAPP_LINK, mergeVariables } from "@/lib/email-templates";

const DEFAULT_STUDENT_PASSWORD = "12345678";

export type ApplicationRow = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    city?: string | null;
    amount_ghs: number;
    tier?: string | null;
    cohort_id: string;
    user_id?: string | null;
};

/**
 * Computes the actual total paid for an application by summing all
 * PAID/SUCCESS payments linked to it. Uses both `application_id` and
 * `payment_reference` to find all associated payments (de-duplicated by ID).
 */
async function computeActualPaidForApplication(
    supabase: SupabaseClient,
    applicationId: string
): Promise<number> {
    const paymentsMap = new Map<string, number>();

    const { data: byAppId } = await supabase
        .from("payments")
        .select("id, amount_ghs")
        .eq("application_id", applicationId)
        .in("status", ["PAID", "SUCCESS"]);

    if (byAppId) {
        for (const p of byAppId) {
            paymentsMap.set(p.id, Number(p.amount_ghs || 0));
        }
    }

    const { data: app } = await supabase
        .from("applications")
        .select("payment_reference")
        .eq("id", applicationId)
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

    return Array.from(paymentsMap.values()).reduce((sum, v) => sum + v, 0);
}

/**
 * Creates auth user, profile, enrollment, and sends credentials email.
 * Idempotent: recomputes enrollment financials from actual payment records
 * on every call, preventing double-counting from duplicate webhook/verify calls.
 */
export async function onboardPaidStudent(
    supabase: SupabaseClient,
    appData: ApplicationRow
): Promise<{ ok: boolean; emailSent?: boolean; error?: string }> {
    try {
        const { data: existingEnrollment } = await supabase
            .from("enrollments")
            .select("id, total_paid, balance_due")
            .eq("application_id", appData.id)
            .single();

        if (existingEnrollment) {
            const actualPaid = await computeActualPaidForApplication(supabase, appData.id);
            const correctBalance = Math.max(0, COURSE_TOTAL_GHS - actualPaid);

            if (
                actualPaid !== Number(existingEnrollment.total_paid) ||
                correctBalance !== Number(existingEnrollment.balance_due)
            ) {
                await supabase.from("enrollments").update({
                    total_paid: actualPaid,
                    balance_due: correctBalance,
                    updated_at: new Date().toISOString(),
                }).eq("id", existingEnrollment.id);
                console.log(`[Onboard] Reconciled enrollment ${existingEnrollment.id}: paid=${actualPaid}, due=${correctBalance}`);
            } else {
                console.log(`[Onboard] Enrollment ${existingEnrollment.id} already correct: paid=${actualPaid}, due=${correctBalance}`);
            }

            return { ok: true };
        }

        const tempPassword = DEFAULT_STUDENT_PASSWORD;

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: appData.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: `${appData.first_name} ${appData.last_name}` },
        });

        if (authError) {
            if (authError.message.includes("already been registered")) {
                const { data: existingUsers } = await supabase.auth.admin.listUsers();
                const existing = existingUsers?.users?.find((u: { email?: string | null; id: string }) => u.email === appData.email);
                if (existing) {
                    await ensureProfileAndEnrollment(supabase, appData, existing.id);
                    const emailSent = await sendWelcomeExistingEmail(appData.email, appData.first_name);
                    await sendWelcomeSms(appData.first_name, appData.email, DEFAULT_STUDENT_PASSWORD, appData.phone);
                    return { ok: true, emailSent };
                }
            }
            console.error("[Onboard] Auth error:", authError);
            return { ok: false, error: authError.message };
        }

        if (!authData?.user) return { ok: false, error: "No user returned" };

        await supabase.from("profiles").upsert({
            id: authData.user.id,
            email: appData.email,
            role: "STUDENT",
            full_name: `${appData.first_name} ${appData.last_name}`,
            phone: appData.phone || "",
            city: appData.city || "",
        });

        const actualPaid = await computeActualPaidForApplication(supabase, appData.id);
        const balanceDue = Math.max(0, COURSE_TOTAL_GHS - actualPaid);

        await supabase.from("enrollments").insert({
            user_id: authData.user.id,
            cohort_id: appData.cohort_id,
            application_id: appData.id,
            is_active: true,
            total_paid: actualPaid,
            balance_due: balanceDue,
        });

        await supabase.from("applications").update({ user_id: authData.user.id }).eq("id", appData.id);

        const emailSent = await sendCredentialsEmail(
            appData.email,
            tempPassword,
            appData.first_name,
            appData.last_name
        );
        await sendPaymentConfirmationSms(appData.first_name, appData.amount_ghs, appData.tier, appData.phone);
        await sendWelcomeSms(appData.first_name, appData.email, tempPassword, appData.phone);
        return { ok: true, emailSent };
    } catch (e) {
        console.error("[Onboard] Error:", e);
        return { ok: false, error: String(e) };
    }
}

async function ensureProfileAndEnrollment(
    supabase: SupabaseClient,
    appData: ApplicationRow,
    userId: string
) {
    const { data: prof } = await supabase.from("profiles").select("id").eq("id", userId).single();
    if (!prof) {
        await supabase.from("profiles").upsert({
            id: userId,
            email: appData.email,
            role: "STUDENT",
            full_name: `${appData.first_name} ${appData.last_name}`,
            phone: appData.phone || "",
            city: appData.city || "",
        });
    }
    const { data: enroll } = await supabase
        .from("enrollments")
        .select("id, total_paid, balance_due")
        .eq("application_id", appData.id)
        .single();

    if (!enroll) {
        const actualPaid = await computeActualPaidForApplication(supabase, appData.id);
        const balanceDue = Math.max(0, COURSE_TOTAL_GHS - actualPaid);
        await supabase.from("enrollments").insert({
            user_id: userId,
            cohort_id: appData.cohort_id,
            application_id: appData.id,
            is_active: true,
            total_paid: actualPaid,
            balance_due: balanceDue,
        });
    } else {
        const actualPaid = await computeActualPaidForApplication(supabase, appData.id);
        const correctBalance = Math.max(0, COURSE_TOTAL_GHS - actualPaid);
        if (actualPaid !== Number(enroll.total_paid) || correctBalance !== Number(enroll.balance_due)) {
            await supabase.from("enrollments").update({
                total_paid: actualPaid,
                balance_due: correctBalance,
                updated_at: new Date().toISOString(),
            }).eq("id", enroll.id);
        }
    }

    await supabase.from("applications").update({ user_id: userId }).eq("id", appData.id);
}

async function sendWelcomeExistingEmail(email: string, firstName: string): Promise<boolean> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkhub.org";
    const template = EMAIL_TEMPLATES.welcome_existing;
    const html = mergeVariables(template.body, {
        first_name: firstName,
        login_url: `${appUrl}/student`,
    });

    const result = await sendEmail({
        to: email,
        subject: mergeVariables(template.subject, { first_name: firstName }),
        html,
    });
    return result.success;
}

async function sendCredentialsEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string
): Promise<boolean> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkhub.org";
    const template = EMAIL_TEMPLATES.credentials;
    const html = mergeVariables(template.body, {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        login_url: `${appUrl}/student`,
    });

    const result = await sendEmail({
        to: email,
        subject: mergeVariables(template.subject, { first_name: firstName }),
        html,
    });

    if (result.success) {
        console.log(`[Onboard] Emailed credentials to ${email}`);
    }
    return result.success;
}

async function sendPaymentConfirmationSms(
    firstName: string,
    amount: number,
    tier: string | null | undefined,
    phone: string | null | undefined
): Promise<void> {
    if (!phone?.trim()) return;
    const tierLabel = tier ? `${tier}%` : "your";
    const message = mergeVariables(SMS_TEMPLATES.payment_confirmation.body, {
        first_name: firstName,
        amount: String(amount),
        tier: tierLabel,
        whatsapp_link: COHORT_WHATSAPP_LINK,
    });
    const result = await SmsAdapter.send({ to: phone, message });
    if (result.success) console.log(`[Onboard] Payment confirmation SMS sent to ${phone}`);
    else console.warn(`[Onboard] Payment confirmation SMS failed:`, result.error);
}

async function sendWelcomeSms(
    firstName: string,
    email: string,
    password: string,
    phone: string | null | undefined
): Promise<void> {
    if (!phone?.trim()) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkhub.org";
    const message = mergeVariables(SMS_TEMPLATES.welcome_sms.body, {
        first_name: firstName,
        email,
        password,
        login_url: `${appUrl}/student`,
        whatsapp_link: COHORT_WHATSAPP_LINK,
    });
    const result = await SmsAdapter.send({ to: phone, message });
    if (result.success) console.log(`[Onboard] Welcome SMS sent to ${phone}`);
    else console.warn(`[Onboard] Welcome SMS failed:`, result.error);
}
