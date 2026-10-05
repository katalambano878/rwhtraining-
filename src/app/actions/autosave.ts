"use server";

import { createClient } from "@/lib/db";

export async function autosaveApplicationAction(formData: FormData, applicationId?: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, error: "Supabase config missing" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ageRaw = formData.get("age");
    const data: any = {
        first_name: formData.get("firstName") as string || "",
        last_name: formData.get("lastName") as string || "",
        email: formData.get("email") as string || "",
        phone: formData.get("phone") as string || "",
        age: ageRaw ? Number(ageRaw) : null,
        city: formData.get("city") as string || "",
        occupation: formData.get("occupation") as string || "",
        experience: formData.get("experience") as string || "",
        reason: formData.get("reason") as string || "",
        tier: formData.get("tier") as string || "50",
        status: "DRAFT",
        is_unfinished: true,
        updated_at: new Date().toISOString(),
    };

    // Filter out empty strings if we don't want to overwrite with empty
    // But for autosave, we usually want to save whatever is there.

    if (applicationId) {
        const { data: app, error } = await supabase
            .from("applications")
            .update(data)
            .eq("id", applicationId)
            .select()
            .single();

        if (error) {
            console.error("[RWH] Autosave update error:", error);
            return { success: false, error: error.message };
        }
        return { success: true, id: app.id };
    } else {
        // Only insert if we have at least an email or name to identify them later
        if (!data.first_name && !data.email && !data.phone) {
            return { success: false, error: "Not enough info to save draft" };
        }

        const { data: app, error } = await supabase
            .from("applications")
            .insert({
                ...data,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("[RWH] Autosave insert error:", error);
            return { success: false, error: error.message };
        }
        return { success: true, id: app.id };
    }
}
