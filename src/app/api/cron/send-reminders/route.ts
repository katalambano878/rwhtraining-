import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { SmsAdapter } from "@/lib/sms-adapter";
import { sendEmail } from "@/lib/send-email";
import { wrapInLayout, mergeVariables } from "@/lib/email-templates";
const CLASS_DATE = new Date("2026-06-01T08:00:00Z"); // Monday June 1, 8am GMT

const SMS_SUFFIX = ` - Remote Work Hub`;

/**
 * Escalating SMS messages based on days until class.
 * Daily messages go out via both SMS and email (8am & 7pm Ghana).
 * Morning messages are motivational; evening are more urgent.
 */
function getReminderSms(daysLeft: number, timeOfDay: "morning" | "evening", firstName: string): string {
  const name = firstName || "there";

  if (daysLeft >= 4) {
    if (timeOfDay === "morning") {
      return `Good morning ${name}! The Remote Work Hub Elite Web Dev Masterclass starts in just ${daysLeft} days (Monday June 1). Seats are filling fast! Complete your application & secure your spot: remoteworkhub.org/apply` + SMS_SUFFIX;
    }
    return `Hey ${name}, only ${daysLeft} days until the Remote Work Hub Masterclass begins! This is your chance to learn web development, complete a 1-month internship & land your first client. Don't miss out - apply now: remoteworkhub.org/apply` + SMS_SUFFIX;
  }

  if (daysLeft === 3) {
    if (timeOfDay === "morning") {
      return `Good morning ${name}! 3 DAYS LEFT. The Remote Work Hub Masterclass starts Monday. In 4 weeks you could be building real apps & earning from tech. Start with just GHS 200. Apply: remoteworkhub.org/apply` + SMS_SUFFIX;
    }
    return `${name}, the weekend is here but the clock is ticking! Only 3 days until the Masterclass starts. This could change your career forever. Complete your application NOW: remoteworkhub.org/apply` + SMS_SUFFIX;
  }

  if (daysLeft === 2) {
    if (timeOfDay === "morning") {
      return `Good morning ${name}! 2 DAYS TO GO. Monday is almost here. The Remote Work Hub Masterclass is your shortcut to becoming a professional web developer. Secure your spot today: remoteworkhub.org/apply` + SMS_SUFFIX;
    }
    return `${name}, ONLY 2 DAYS LEFT! The Elite Web Dev Masterclass kicks off Monday morning. Paid internship included. Don't let this opportunity pass you. Apply & pay now: remoteworkhub.org/apply` + SMS_SUFFIX;
  }

  if (daysLeft === 1) {
    if (timeOfDay === "morning") {
      return `TOMORROW, ${name}! The Remote Work Hub Masterclass starts TOMORROW (Monday June 1). This is your LAST CHANCE to enroll. Complete your application and payment right now: remoteworkhub.org/apply` + SMS_SUFFIX;
    }
    return `FINAL REMINDER ${name}! The Masterclass starts TOMORROW MORNING. After tonight, enrollment closes. If you've been waiting, the time is NOW. Apply: remoteworkhub.org/apply` + SMS_SUFFIX;
  }

  return `IT'S HERE, ${name}! The Remote Work Hub Elite Web Dev Masterclass starts TODAY! If you haven't enrolled yet, there's still time. Don't be left behind. Apply now: remoteworkhub.org/apply` + SMS_SUFFIX;
}

function getReminderEmail(daysLeft: number, timeOfDay: "morning" | "evening", firstName: string): { subject: string; html: string } {
  const name = firstName || "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkhub.org";

  let subject: string;
  let bodyContent: string;
  let urgencyBadge: string;
  let urgencyColor: string;

  if (daysLeft >= 4) {
    subject = `${name}, the Masterclass starts in ${daysLeft} days!`;
    urgencyBadge = `${daysLeft} DAYS LEFT`;
    urgencyColor = "#2563EB";
    bodyContent = timeOfDay === "morning"
      ? `<p>Good morning! Just a friendly reminder that the <strong>Elite Web Development & SaaS Masterclass</strong> starts on <strong>Monday, June 1</strong>.</p><p>Seats are filling up fast. If you haven't completed your application and payment yet, now is the perfect time.</p>`
      : `<p>The clock is ticking! In just ${daysLeft} days, the Masterclass begins. This is your opportunity to learn web development, complete a 1-month internship, and land your first client.</p><p>Don't let this chance pass you by.</p>`;
  } else if (daysLeft === 3) {
    subject = `Only 3 days left, ${name}!`;
    urgencyBadge = "3 DAYS LEFT";
    urgencyColor = "#d97706";
    bodyContent = timeOfDay === "morning"
      ? `<p>Good morning! The Masterclass starts in just <strong>3 days</strong>. This weekend is your last chance to complete your application and secure your seat.</p><p>In 4 weeks, you could be building real web applications and earning from tech. All it takes is starting with <strong>GHS 200</strong>.</p>`
      : `<p>The weekend is here but the clock is ticking! Monday will be here before you know it.</p><p>The students who are already enrolled are prepping their development environments. Don't get left behind.</p>`;
  } else if (daysLeft === 2) {
    subject = `${name}, 2 days to go!`;
    urgencyBadge = "2 DAYS LEFT";
    urgencyColor = "#ea580c";
    bodyContent = timeOfDay === "morning"
      ? `<p>Good morning! The Masterclass is <strong>2 days away</strong>. Monday is almost here.</p><p>This isn't just another course — it's 4 weeks of building real products, with a <strong>1-month internship</strong> at Doctor Barns Tech waiting for you at the end.</p>`
      : `<p><strong>Only 2 days remain.</strong> The Elite Web Dev Masterclass kicks off Monday morning and seats are almost full.</p><p>If you've been on the fence, this is your sign. The investment starts at just GHS 200.</p>`;
  } else if (daysLeft === 1) {
    subject = timeOfDay === "morning"
      ? `TOMORROW! ${name}, the Masterclass starts tomorrow!`
      : `FINAL REMINDER: Class starts tomorrow morning, ${name}!`;
    urgencyBadge = "STARTS TOMORROW";
    urgencyColor = "#dc2626";
    bodyContent = timeOfDay === "morning"
      ? `<p><strong>This is it.</strong> The Masterclass starts <strong>TOMORROW</strong> (Monday, June 1).</p><p>This is your last full day to complete your application and payment. After tonight, it may be too late to join this cohort.</p>`
      : `<p><strong>FINAL REMINDER.</strong> The Masterclass begins <strong>tomorrow morning</strong>.</p><p>If you've been thinking about it, procrastinating, or waiting for the "right time" — this is it. After tonight, enrollment may close.</p><p>Don't wake up Monday morning with regret. Secure your spot NOW.</p>`;
  } else {
    subject = `IT'S TODAY! The Masterclass starts now, ${name}!`;
    urgencyBadge = "STARTS TODAY";
    urgencyColor = "#dc2626";
    bodyContent = `<p>The <strong>Elite Web Development & SaaS Masterclass</strong> starts <strong>TODAY</strong>!</p><p>If you haven't enrolled yet, there may still be time. Don't be the one who almost joined. Take action right now.</p>`;
  }

  const html = wrapInLayout(`
    <div style="text-align: center; margin-bottom: 28px;">
      <span style="display: inline-block; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; background: ${urgencyColor}15; color: ${urgencyColor}; border: 1px solid ${urgencyColor}40;">${urgencyBadge}</span>
    </div>
    <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 18px; letter-spacing: -0.5px; line-height: 1.3;">Hey ${name},</h2>
    ${bodyContent}

    <div style="background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fef3c7 100%); border-radius: 16px; padding: 28px; margin: 28px 0; text-align: center;">
      <p style="font-size: 12px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px;">Class Starts</p>
      <p style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.5px;">Monday, June 1</p>
      <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">Start with just <strong>GHS 200</strong> (20% deposit)</p>
    </div>

    <div style="text-align: center; margin: 32px 0 16px;">
      <a href="${appUrl}/apply" style="display: inline-block; background: ${daysLeft <= 1 ? '#dc2626' : '#2563EB'}; color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px;">${daysLeft <= 1 ? 'Enroll Now — Last Chance' : 'Complete Your Application'} &rarr;</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center;">Questions? Reply to this email or WhatsApp us. We're here to help.</p>
  `, subject);

  return { subject, html };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const ghanaHour = now.getUTCHours(); // Ghana is UTC+0
    const timeOfDay: "morning" | "evening" = ghanaHour < 12 ? "morning" : "evening";

    const msUntilClass = CLASS_DATE.getTime() - now.getTime();
    const daysLeft = Math.ceil(msUntilClass / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return NextResponse.json({
        message: "Class has already started. No more reminders.",
        daysLeft,
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch applications that are NOT paid/approved (drafts + pending payments)
    const { data: unpaidApps, error } = await supabase
      .from("applications")
      .select("id, first_name, last_name, email, phone, payment_status, status, is_unfinished")
      .or("payment_status.neq.PAID,payment_status.is.null")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Reminders] DB error:", error);
      return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
    }

    // Dedupe by phone/email
    const seen = new Set<string>();
    const recipients = (unpaidApps || []).filter((a: { phone?: string | null; email?: string | null }) => {
      const key = a.phone || a.email;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const smsConfigured = SmsAdapter.isConfigured();
    if (!smsConfigured) {
      console.warn("[Reminders] SMS is NOT configured (set MOOLRE_SMS_VASKEY and SMS_SENDER_ID in production). Only emails will be sent.");
    }

    let smsSent = 0;
    let smsFailed = 0;
    let emailSent = 0;
    let emailFailed = 0;

    for (const recipient of recipients) {
      const firstName = recipient.first_name || "there";

      // Daily messages go out via BOTH SMS and email when contact info exists
      if (recipient.phone) {
        const smsMessage = getReminderSms(daysLeft, timeOfDay, firstName);
        const result = await SmsAdapter.send({ to: recipient.phone, message: smsMessage });
        if (result.success) smsSent++;
        else smsFailed++;
        await new Promise(r => setTimeout(r, 100));
      }
      if (recipient.email) {
        const { subject, html } = getReminderEmail(daysLeft, timeOfDay, firstName);
        const result = await sendEmail({ to: recipient.email, subject, html });
        if (result.success) emailSent++;
        else emailFailed++;
        await new Promise(r => setTimeout(r, 50));
      }
    }

    // Log to campaigns table
    await supabase.from("campaigns").insert({
      name: `Auto Reminder — ${daysLeft}d left (${timeOfDay})`,
      channel: "sms+email",
      subject: `${daysLeft} days until class`,
      body: getReminderSms(daysLeft, timeOfDay, "{{first_name}}"),
      audience_type: "unpaid_unapproved",
      audience_filter: { daysLeft, timeOfDay },
      status: "sent",
      sent_at: new Date().toISOString(),
      total_recipients: recipients.length,
      total_sent: smsSent + emailSent,
      total_failed: smsFailed + emailFailed,
    });

    const summary = {
      success: true,
      daysLeft,
      timeOfDay,
      ghanaTime: now.toISOString(),
      recipients: recipients.length,
      smsConfigured,
      sms: { sent: smsSent, failed: smsFailed },
      email: { sent: emailSent, failed: emailFailed },
      message: smsConfigured
        ? `Reminders sent: ${smsSent} SMS + ${emailSent} emails (${daysLeft} days until class, ${timeOfDay} batch)`
        : `SMS not configured in this environment. Emails only: ${emailSent} sent. Set MOOLRE_SMS_VASKEY and SMS_SENDER_ID on Vercel.`,
    };

    console.log("[Reminders]", summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[Reminders] Error:", error);
    return NextResponse.json({ error: "Reminder cron failed" }, { status: 500 });
  }
}
