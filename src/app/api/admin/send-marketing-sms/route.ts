import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/lib/db";
import { SmsAdapter } from "@/lib/sms-adapter";

/**
 * POST /api/admin/send-marketing-sms
 * Sends a bulk SMS campaign to non-enrolled leads.
 * Requires admin session. Replaces {{first_name}} in the message template.
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
        const messageTemplate = body.message_template as string;
        const leadIds = body.lead_ids as string[];

        if (!messageTemplate?.trim()) {
            return NextResponse.json({ error: "message_template is required" }, { status: 400 });
        }
        if (!leadIds?.length) {
            return NextResponse.json({ error: "lead_ids is required" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey);

        // Verify these are genuinely non-enrolled leads
        const { data: enrollments } = await serviceSupabase
            .from("enrollments")
            .select("application_id");
        const enrolledAppIds = new Set((enrollments || []).map((e: any) => e.application_id));

        const { data: apps, error: appsErr } = await serviceSupabase
            .from("applications")
            .select("id, first_name, phone")
            .in("id", leadIds);

        if (appsErr || !apps) {
            return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
        }

        const validLeads = apps.filter((app: any) => {
            if (enrolledAppIds.has(app.id)) return false;
            if (!app.phone?.trim()) return false;
            return true;
        });

        let sent = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const lead of validLeads) {
            const personalizedMessage = messageTemplate.replace(
                /\{\{first_name\}\}/g,
                lead.first_name || "there"
            );

            const result = await SmsAdapter.send({
                to: lead.phone,
                message: personalizedMessage,
            });

            if (result.success) {
                sent++;
            } else {
                failed++;
                errors.push(`${lead.first_name || "Unknown"} (${lead.phone}): ${result.error}`);
            }

            await new Promise(r => setTimeout(r, 150));
        }

        console.log(`[Marketing SMS] Campaign complete: sent=${sent}, failed=${failed}, total=${validLeads.length}`);

        return NextResponse.json({
            ok: true,
            sent,
            failed,
            total: validLeads.length,
            skipped_enrolled: apps.length - validLeads.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("[Marketing SMS] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
