import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_API_BASE = "https://zoepayhub.com";

export interface ZoeCheckoutResult {
  reference: string;
  clientReference: string;
  checkoutUrl: string;
  environment: string;
  status: string;
}

/** Ghana MSISDN as 233XXXXXXXXX. Accepts a local 0XXXXXXXXX number. */
export function toGhPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^233\d{9}$/.test(digits)) return digits;
  if (/^0\d{9}$/.test(digits)) return `233${digits.slice(1)}`;
  return null;
}

export function zoeApiBase(): string {
  return (process.env.ZOE_API_BASE || DEFAULT_API_BASE).replace(/\/$/, "");
}

/** Generate a unique RWH transaction reference (shared across gateways). */
export function generateReference(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `RWH-${timestamp}-${random}`;
}

export interface ZoeVerifyResult {
  status: "SUCCESS" | "PENDING" | "FAILED";
  message: string;
  data?: unknown;
}

/**
 * Verify a payment with Zoe Pay by our clientReference (RWH-...).
 * Zoe rechecks the upstream processor itself when the payment is still open.
 */
export async function verifyZoePayment(reference: string): Promise<ZoeVerifyResult> {
  const apiKey = process.env.ZOE_SECRET_KEY?.trim();
  if (!apiKey) {
    return { status: "FAILED", message: "ZOE_SECRET_KEY is not set" };
  }
  try {
    const response = await fetch(
      `${zoeApiBase()}/api/v1/payments/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      },
    );
    const json = (await response.json()) as {
      success?: boolean;
      data?: { status?: string } | null;
      error?: { message?: string } | null;
    };
    if (!response.ok || !json.success || !json.data) {
      return {
        status: response.status === 404 ? "FAILED" : "PENDING",
        message: json.error?.message || "Could not verify payment with Zoe Pay",
      };
    }
    const zoeStatus = json.data.status || "pending";
    if (zoeStatus === "success") {
      return { status: "SUCCESS", message: "Payment verified successfully.", data: json.data };
    }
    if (zoeStatus === "failed" || zoeStatus === "cancelled" || zoeStatus === "expired") {
      return { status: "FAILED", message: `Payment ${zoeStatus}.`, data: json.data };
    }
    return { status: "PENDING", message: "Payment is still processing.", data: json.data };
  } catch (error) {
    console.error("[ZoePay] Verify error:", error);
    return { status: "FAILED", message: "Could not verify payment status." };
  }
}

/**
 * Verify `X-Zoe-Signature` (`t=<unix>,v1=<hex>`). Rejects stale timestamps
 * so a captured delivery cannot be replayed later.
 */
export function verifyZoeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (!header || !secret) return false;
  const parts = new Map<string, string>();
  for (const piece of header.split(",")) {
    const eq = piece.indexOf("=");
    if (eq <= 0) continue;
    parts.set(piece.slice(0, eq).trim(), piece.slice(eq + 1).trim());
  }
  const timestamp = parts.get("t");
  const signature = parts.get("v1");
  if (!timestamp || !signature || !/^[0-9a-f]+$/i.test(signature)) return false;
  const issued = Number(timestamp);
  if (!Number.isFinite(issued) || Math.abs(nowSeconds - issued) > 300) return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(signature, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Create a hosted Zoe checkout. The secret stays on the server. */
export async function createZoeCheckout(input: {
  amountGhs: number;
  clientReference: string;
  description: string;
  customer: { name: string; email: string; phone: string };
  returnUrl?: string;
}): Promise<ZoeCheckoutResult> {
  const apiKey = process.env.ZOE_SECRET_KEY?.trim();
  if (!apiKey) {
    throw new Error("ZOE_SECRET_KEY is not set");
  }
  const response = await fetch(`${zoeApiBase()}/api/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.clientReference,
    },
    body: JSON.stringify({
      amount: input.amountGhs,
      currency: "GHS",
      clientReference: input.clientReference,
      description: input.description,
      customer: input.customer,
      returnUrl: input.returnUrl,
    }),
  });
  const json = (await response.json()) as {
    success?: boolean;
    data?: {
      reference?: string;
      clientReference?: string;
      checkoutUrl?: string;
      environment?: string;
      status?: string;
    };
    error?: { message?: string } | null;
  };
  if (!response.ok || !json.success || !json.data?.checkoutUrl || !json.data.reference) {
    const message = json.error?.message || "Zoe could not start this payment";
    throw new Error(message);
  }
  return {
    reference: json.data.reference,
    clientReference: json.data.clientReference || input.clientReference,
    checkoutUrl: json.data.checkoutUrl,
    environment: json.data.environment || "test",
    status: json.data.status || "pending",
  };
}
