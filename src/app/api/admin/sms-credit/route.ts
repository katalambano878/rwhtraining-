import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { confirmSmsCheckout, getSmsBilling, startSmsCheckout, taysendConfigured } from "@/lib/taysend-billing";

export const dynamic = "force-dynamic";

const PACKAGE_ID = /^[a-z0-9-]{1,40}$/;
const PAYMENT_ID = /^pay_[A-Za-z0-9]+$/;

async function requireAdminApi() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  if (!taysendConfigured()) {
    return NextResponse.json({ configured: false });
  }

  try {
    const billing = await getSmsBilling();
    const checkoutId = request.nextUrl.searchParams.get("checkout") || "";
    const checkout = PAYMENT_ID.test(checkoutId) ? await confirmSmsCheckout(checkoutId) : null;
    return NextResponse.json({ configured: true, ...billing, checkout });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load SMS packages.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  if (!taysendConfigured()) {
    return NextResponse.json({ error: "SMS buying is not connected yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const packageId = typeof body?.package_id === "string" ? body.package_id : "";
  if (!PACKAGE_ID.test(packageId)) {
    return NextResponse.json({ error: "Choose a package from the list." }, { status: 400 });
  }

  try {
    const checkout = await startSmsCheckout(packageId);
    return NextResponse.json(checkout);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start payment.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
