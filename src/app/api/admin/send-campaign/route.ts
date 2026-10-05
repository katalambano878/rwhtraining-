import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { createClient as createServerSupabase } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/send-email";
import { SmsAdapter } from "@/lib/sms-adapter";
import { mergeVariables, wrapInLayout } from "@/lib/email-templates";

type AudienceType = "all_paid" | "all_applicants" | "abandoned_drafts" | "partial_payers" | "full_payers" | "by_tier" | "by_city" | "custom";

interface Recipient {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  tier?: string;
  amount_ghs?: number;
  balance_due?: number;
}

async function getAudience(supabase: any, audienceType: AudienceType, filter: any): Promise<Recipient[]> {
  let recipients: Recipient[] = [];

  switch (audienceType) {
    case "all_paid": {
      const { data } = await supabase.from("applications").select("*").eq("payment_status", "PAID").eq("is_unfinished", false);
      recipients = (data || []).map((a: any) => ({ email: a.email, phone: a.phone || "", first_name: a.first_name, last_name: a.last_name, tier: a.tier, amount_ghs: a.amount_ghs }));
      break;
    }
    case "all_applicants": {
      const { data } = await supabase.from("applications").select("*").eq("is_unfinished", false);
      recipients = (data || []).map((a: any) => ({ email: a.email, phone: a.phone || "", first_name: a.first_name, last_name: a.last_name, tier: a.tier, amount_ghs: a.amount_ghs }));
      break;
    }
    case "abandoned_drafts": {
      const { data } = await supabase.from("applications").select("*").eq("is_unfinished", true);
      recipients = (data || []).filter((a: any) => a.email || a.phone).map((a: any) => ({ email: a.email || "", phone: a.phone || "", first_name: a.first_name || "there", last_name: a.last_name || "", tier: a.tier, amount_ghs: a.amount_ghs }));
      break;
    }
    case "partial_payers": {
      const { data: enrollments } = await supabase.from("enrollments").select("*, applications(*)").gt("balance_due", 0);
      recipients = (enrollments || []).map((e: any) => ({
        email: e.applications?.email || "", phone: e.applications?.phone || "",
        first_name: e.applications?.first_name || "", last_name: e.applications?.last_name || "",
        tier: e.applications?.tier, amount_ghs: e.total_paid, balance_due: e.balance_due
      }));
      break;
    }
    case "full_payers": {
      const { data: enrollments } = await supabase.from("enrollments").select("*, applications(*)").eq("balance_due", 0);
      recipients = (enrollments || []).map((e: any) => ({
        email: e.applications?.email || "", phone: e.applications?.phone || "",
        first_name: e.applications?.first_name || "", last_name: e.applications?.last_name || "",
        tier: e.applications?.tier, amount_ghs: e.total_paid
      }));
      break;
    }
    case "by_tier": {
      const { data } = await supabase.from("applications").select("*").eq("tier", filter?.tier).eq("is_unfinished", false);
      recipients = (data || []).map((a: any) => ({ email: a.email, phone: a.phone || "", first_name: a.first_name, last_name: a.last_name, tier: a.tier, amount_ghs: a.amount_ghs }));
      break;
    }
    case "by_city": {
      const { data } = await supabase.from("applications").select("*").ilike("city", `%${filter?.city || ""}%`).eq("is_unfinished", false);
      recipients = (data || []).map((a: any) => ({ email: a.email, phone: a.phone || "", first_name: a.first_name, last_name: a.last_name, tier: a.tier, amount_ghs: a.amount_ghs }));
      break;
    }
    default:
      break;
  }

  const seen = new Set<string>();
  return recipients.filter(r => {
    const key = r.email || r.phone;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Detects if the message body is already wrapped in a full HTML template
 * (i.e. from a pre-built EMAIL_TEMPLATE) vs. plain/partial content.
 */
function isFullHtmlDocument(html: string): boolean {
  return html.trim().toLowerCase().startsWith("<!doctype") || html.trim().toLowerCase().startsWith("<html");
}

export async function POST(request: NextRequest) {
  try {
    const serverClient = await createServerSupabase();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await serverClient.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { channel, subject, messageBody, audienceType, audienceFilter, campaignName, customRecipients } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let recipients: Recipient[];

    if (audienceType === "custom" && Array.isArray(customRecipients)) {
      recipients = customRecipients;
    } else {
      recipients = await getAudience(supabase, audienceType, audienceFilter);
    }

    if (!recipients.length) {
      return NextResponse.json({ error: "No recipients found for this audience" }, { status: 400 });
    }

    const { data: campaign } = await supabase.from("campaigns").insert({
      name: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
      channel, subject, body: messageBody,
      audience_type: audienceType,
      audience_filter: audienceFilter || {},
      status: "sending",
      total_recipients: recipients.length,
      created_by: user.id,
    }).select().single();

    let totalSent = 0;
    let totalFailed = 0;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkhub.org";

    for (const recipient of recipients) {
      const vars: Record<string, string> = {
        first_name: recipient.first_name || "there",
        last_name: recipient.last_name || "",
        email: recipient.email || "",
        amount: String(recipient.amount_ghs || 0),
        balance: String(recipient.balance_due || 0),
        tier: recipient.tier || "",
        login_url: `${appUrl}/student`,
        cohort_name: "2026 Elite Web Development & SaaS Masterclass",
        subject_line: subject || "",
        message_body: messageBody || "",
      };

      const mergedBody = mergeVariables(messageBody, vars);
      const mergedSubject = subject ? mergeVariables(subject, vars) : undefined;

      try {
        if (channel === "email" && recipient.email) {
          let finalHtml: string;
          if (isFullHtmlDocument(mergedBody)) {
            finalHtml = mergedBody;
          } else {
            finalHtml = wrapInLayout(
              `<h2>Hey ${vars.first_name},</h2><div style="font-size: 15px; line-height: 1.8; color: #334155;">${mergedBody}</div>
              <div style="text-align: center; margin: 36px 0 16px;">
                <a href="${vars.login_url}" style="display: inline-block; background: #2563EB; color: #ffffff; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">Go to Dashboard &rarr;</a>
              </div>`,
              mergedSubject || "Message from Remote Work Hub"
            );
          }

          const result = await sendEmail({
            to: recipient.email,
            subject: mergedSubject || "Message from Remote Work Hub",
            html: finalHtml,
          });

          if (campaign) {
            await supabase.from("campaign_messages").insert({
              campaign_id: campaign.id, channel: "email",
              recipient_email: recipient.email, recipient_name: `${recipient.first_name} ${recipient.last_name}`,
              subject: mergedSubject, body: finalHtml, status: result.success ? "sent" : "failed",
              error_message: result.error,
              sent_at: result.success ? new Date().toISOString() : null,
            });
          }
          if (result.success) totalSent++;
          else totalFailed++;
          // SMS as well: notify to check email (no extra totalSent count)
          if (recipient.phone?.trim()) {
            await SmsAdapter.send({ to: recipient.phone, message: "You have a new message from Remote Work Hub - check your email." });
          }
        } else if (channel === "sms" && recipient.phone) {
          const smsResult = await SmsAdapter.send({ to: recipient.phone, message: mergedBody });

          if (campaign) {
            await supabase.from("campaign_messages").insert({
              campaign_id: campaign.id, channel: "sms",
              recipient_phone: recipient.phone, recipient_name: `${recipient.first_name} ${recipient.last_name}`,
              body: mergedBody, status: smsResult.success ? "sent" : "failed",
              error_message: smsResult.error, sent_at: smsResult.success ? new Date().toISOString() : null,
            });
          }
          if (smsResult.success) totalSent++;
          else totalFailed++;
        }
      } catch (err) {
        totalFailed++;
        if (campaign) {
          await supabase.from("campaign_messages").insert({
            campaign_id: campaign.id, channel,
            recipient_email: recipient.email, recipient_phone: recipient.phone,
            recipient_name: `${recipient.first_name} ${recipient.last_name}`,
            subject: mergedSubject, body: mergedBody,
            status: "failed", error_message: String(err),
          });
        }
      }

      await new Promise(r => setTimeout(r, 50));
    }

    if (campaign) {
      await supabase.from("campaigns").update({
        status: "sent", sent_at: new Date().toISOString(),
        total_sent: totalSent, total_failed: totalFailed,
      }).eq("id", campaign.id);
    }

    return NextResponse.json({
      success: true,
      campaign_id: campaign?.id,
      total_recipients: recipients.length,
      total_sent: totalSent,
      total_failed: totalFailed,
      message: `Campaign sent: ${totalSent} delivered, ${totalFailed} failed out of ${recipients.length} recipients`,
    });
  } catch (error) {
    console.error("[Campaign] Error:", error);
    return NextResponse.json({ error: "Campaign send failed" }, { status: 500 });
  }
}
