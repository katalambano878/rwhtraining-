import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updatePassword } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function POST(request: Request) {
  const store = await cookies();
  const user = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  await updatePassword(user.id, password);
  return NextResponse.json({ ok: true });
}
