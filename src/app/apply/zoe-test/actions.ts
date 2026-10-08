"use server";

import { redirect } from "next/navigation";
import { createZoeCheckout, toGhPhone } from "@/lib/zoe-pay";

const TEST_AMOUNT_GHS = 1;

function gateMatches(gate: string): boolean {
  const expected = process.env.ZOE_TEST_GATE?.trim();
  return Boolean(expected) && gate === expected;
}

/** Start a GH₵ 1 simulated checkout. Does not enroll a student. */
export async function startZoeTestCheckout(formData: FormData): Promise<void> {
  const gate = String(formData.get("gate") ?? "");
  if (!gateMatches(gate)) {
    redirect("/");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = toGhPhone(String(formData.get("phone") ?? ""));
  if (name.length < 2 || !email.includes("@") || !phone) {
    redirect(`/apply/zoe-test?gate=${encodeURIComponent(gate)}&error=details`);
  }

  const clientReference = `rwh-zoe-test-${Date.now()}`;
  const checkout = await createZoeCheckout({
    amountGhs: TEST_AMOUNT_GHS,
    clientReference,
    description: "Remote Work Hub Zoe test checkout",
    customer: { name, email, phone },
    returnUrl: "https://remoteworkhub.org/apply/zoe-test",
  });

  if (checkout.environment === "live") {
    redirect(`/apply/zoe-test?gate=${encodeURIComponent(gate)}&error=live`);
  }

  redirect(checkout.checkoutUrl);
}
