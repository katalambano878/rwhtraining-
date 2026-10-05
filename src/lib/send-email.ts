import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || "");
  return _resend;
}

const DEFAULT_FROM_NAME = "Remote Work Hub";
const POSTAL_API_URL = (process.env.POSTAL_API_URL || "https://postal.zoepayhub.com").replace(/\/+$/, "");

function getFromAddress(): string {
  const email = process.env.EMAIL_FROM || "hello@remoteworkhub.org";
  return `${DEFAULT_FROM_NAME} <${email}>`;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
}

async function sendViaPostal(opts: SendEmailOptions, from: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.POSTAL_API_KEY;
  if (!apiKey) return { success: false, error: "Postal is not configured" };

  const response = await fetch(`${POSTAL_API_URL}/api/v1/send/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Server-API-Key": apiKey,
    },
    body: JSON.stringify({
      to: [opts.to],
      from,
      subject: opts.subject,
      html_body: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.status === "error") {
    const detail = data?.data?.message || data?.message || response.statusText;
    return { success: false, error: String(detail) };
  }
  const id = data?.data?.message_id || data?.data?.messages?.[opts.to]?.id;
  return { success: true, id: id ? String(id) : undefined };
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const from = opts.fromName
    ? `${opts.fromName} <${process.env.EMAIL_FROM || "hello@remoteworkhub.org"}>`
    : getFromAddress();

  if (process.env.POSTAL_API_KEY) {
    try {
      const postal = await sendViaPostal(opts, from);
      if (postal.success) return postal;
      console.error("[Email] Postal error:", postal.error);
      if (!process.env.RESEND_API_KEY) return postal;
    } catch (err) {
      console.error("[Email] Postal send error:", err);
      if (!process.env.RESEND_API_KEY) return { success: false, error: String(err) };
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await getResend().emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email] Send error:", err);
    return { success: false, error: String(err) };
  }
}
