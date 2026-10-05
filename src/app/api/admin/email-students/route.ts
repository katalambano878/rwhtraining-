import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/lib/db";
import { sendEmail } from "@/lib/send-email";
import { SmsAdapter } from "@/lib/sms-adapter";
import { wrapInLayout } from "@/lib/email-templates";

/**
 * POST /api/admin/email-students
 * Sends a beautifully-branded email to all paid students.
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
        const subject = (body.subject as string)?.trim() || "Message from Remote Work Hub Masterclass";
        const htmlBody = (body.body as string)?.trim() || "<p>No content.</p>";

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey);
        const { data: paidApps, error } = await serviceSupabase
            .from("applications")
            .select("email, first_name, phone")
            .eq("payment_status", "PAID")
            .not("email", "is", null);

        if (error) {
            console.error("[Email Students] DB error:", error);
            return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
        }

        const recipients = (paidApps || []).filter((a: { email?: string | null }) => a.email);
        if (recipients.length === 0) {
            return NextResponse.json({
                ok: true,
                sent: 0,
                smsSent: 0,
                message: "No paid students to email.",
            });
        }

        let sent = 0;
        let smsSent = 0;
        const smsNotice = "You have a new message from Remote Work Hub - check your email.";

        for (const r of recipients) {
            const firstName = r.first_name || "Student";
            const personalizedBody = htmlBody.replace(/\{\{first_name\}\}/g, firstName);

            const wrappedHtml = wrapInLayout(
                `<h2>Hey ${firstName},</h2>${personalizedBody}`,
                subject
            );

            const result = await sendEmail({
                to: r.email,
                subject,
                html: wrappedHtml,
            });
            if (result.success) sent++;

            if (r.phone?.trim()) {
                const smsResult = await SmsAdapter.send({ to: r.phone, message: smsNotice });
                if (smsResult.success) smsSent++;
            }
        }

        return NextResponse.json({
            ok: true,
            sent,
            smsSent,
            total: recipients.length,
            message: `Emailed ${sent} and sent ${smsSent} SMS to paid students.`,
        });
    } catch (e) {
        console.error("[Email Students] Error:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
