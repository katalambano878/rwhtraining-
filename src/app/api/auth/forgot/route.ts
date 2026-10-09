import { NextResponse } from "next/server";
import { createPasswordReset } from "@/lib/db";
import { sendEmail } from "@/lib/send-email";
import { SmsAdapter } from "@/lib/sms-adapter";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const attempts = new Map<string, number[]>();

function isLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);
  return false;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char
  ));
}

function resetEmail(firstName: string, link: string): string {
  const name = escapeHtml(firstName);
  return `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.6">
  <p>Hi ${name},</p>
  <p>We received a request to reset your Remote Work Hub student password. This link expires in one hour.</p>
  <p style="margin:28px 0">
    <a href="${link}" style="background:#2563EB;color:#fff;text-decoration:none;padding:14px 26px;border-radius:10px;font-weight:bold;display:inline-block">Reset my password</a>
  </p>
  <p>If the button does not open, use this link:<br/><a href="${link}">${link}</a></p>
  <p>If you did not ask for this, you can ignore this email.</p>
  <p>Remote Work Hub</p>
</div>`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter the email on your student account." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isLimited(`${ip}:${email}`)) {
    return NextResponse.json({ error: "Too many reset attempts. Please wait a few minutes." }, { status: 429 });
  }

  const message = "If an account exists for that email, we sent a reset link. It expires in one hour.";
  const reset = await createPasswordReset(email);
  if (!reset) return NextResponse.json({ ok: true, message });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkhub.org";
  const link = `${appUrl}/student?recovery=${reset.token}`;
  const emailResult = await sendEmail({
    to: reset.email,
    subject: "Reset your Remote Work Hub password",
    html: resetEmail(reset.firstName, link),
    replyTo: "info@remoteworkhub.org",
  });

  let smsSent = false;
  if (reset.phone.trim()) {
    const sms = await SmsAdapter.send({
      to: reset.phone,
      message: `Hi ${reset.firstName}, reset your Remote Work Hub password here. This link expires in 1 hour: ${link}`,
    });
    smsSent = sms.success;
  }

  if (!emailResult.success && !smsSent) {
    console.error("[Auth] Password reset delivery failed:", emailResult.error);
    return NextResponse.json({ error: "We couldn't send the reset link. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message });
}
