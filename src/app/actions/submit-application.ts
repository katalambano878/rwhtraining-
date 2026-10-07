"use server";

import { MoolreAdapter, type PaymentTier, type MomoNetwork, type TransactionPayload } from "@/lib/moolre-adapter";
import { COURSE_TOTAL_GHS } from "@/lib/pricing";
import { PaystackAdapter } from "@/lib/paystack-adapter";
import { createClient } from "@/lib/db";
import { applicationSchema } from "@/lib/validations";

export async function submitApplicationAction(formData: FormData) {
    const raw = {
        applicationId: (formData.get("applicationId") as string) || "",
        firstName: (formData.get("firstName") as string) || "",
        lastName: (formData.get("lastName") as string) || "",
        email: (formData.get("email") as string) || "",
        phone: (formData.get("phone") as string) || "",
        age: formData.get("age") ? Number(formData.get("age")) : undefined,
        city: (formData.get("city") as string) || "",
        occupation: (formData.get("occupation") as string) || "",
        experience: (formData.get("experience") as string) || "",
        reason: (formData.get("reason") as string) || "",
        classFormat: (formData.get("classFormat") as string) || "hybrid",
        tier: "100",
        paymentMethod: (formData.get("paymentMethod") as string) || "moolre",
    };

    const parsed = applicationSchema.safeParse(raw);
    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message || "Invalid form data";
        return { success: false, error: firstError, redirect_url: null };
    }

    const { firstName, lastName, email, phone, age, city, occupation, experience, reason, classFormat, tier, paymentMethod, applicationId } = parsed.data;
    const usePaystack = paymentMethod === "paystack";

    const amount_ghs = COURSE_TOTAL_GHS;

    const reference = MoolreAdapter.generateReference();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: activeCohort } = await supabase
            .from("cohorts")
            .select("id")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        const applicationData = {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            age: age || null,
            city,
            occupation,
            experience,
            reason,
            class_format: classFormat === "online" ? "online" : "hybrid",
            tier,
            amount_ghs,
            payment_reference: reference,
            payment_status: "PENDING",
            status: "PENDING_REVIEW",
            is_unfinished: false,
            cohort_id: activeCohort?.id || null,
            updated_at: new Date().toISOString(),
        };

        let appError;
        if (applicationId) {
            const { error } = await supabase.from("applications")
                .update(applicationData)
                .eq("id", applicationId);
            appError = error;
        } else {
            const { error } = await supabase.from("applications").insert({
                ...applicationData,
                created_at: new Date().toISOString(),
            });
            appError = error;
        }

        if (appError) {
            console.error("[RWH] Failed to save application:", appError);
        }

        const { error: payError } = await supabase.from("payments").insert({
            reference,
            email,
            phone,
            network: usePaystack ? "CARD" : "MOMO",
            amount_ghs,
            tier,
            first_name: firstName,
            last_name: lastName,
            gateway: usePaystack ? "paystack" : "moolre",
            status: "PENDING",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        if (payError) {
            console.error("[RWH] Failed to save payment:", payError);
        }
    }

    let gatewayRes;

    if (usePaystack) {
        gatewayRes = await PaystackAdapter.initializeTransaction({
            email,
            amount_ghs,
            first_name: firstName,
            last_name: lastName,
            reference,
        });
    } else {
        const transactionPayload: TransactionPayload = {
            email,
            amount_ghs,
            tier: tier as PaymentTier,
            phone: phone,
            network: "MTN",
            first_name: firstName,
            last_name: lastName,
            reference,
        };
        gatewayRes = await MoolreAdapter.initializeTransaction(transactionPayload);
    }

    return {
        success: true,
        error: null,
        redirect_url: gatewayRes.checkout_url,
        reference: gatewayRes.reference,
        payment_status: gatewayRes.status,
        message: gatewayRes.message,
    };
}
