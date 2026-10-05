"use server";

import { createClient } from "@/lib/db";
import { createClient as createServerSupabase } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteApplicationAction(id: string) {
    if (!id || typeof id !== "string") {
        return { success: false, error: "Invalid application ID" };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

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

    const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("[RWH] Delete application error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/drafts");
    return { success: true };
}
