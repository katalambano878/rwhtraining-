import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function GET() {
  const store = await cookies();
  const user = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createClient();
  const [profileRes, enrollRes, appRes] = await Promise.all([
    db.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    db.from("enrollments").select("*").eq("user_id", user.id).maybeSingle(),
    db.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  return NextResponse.json({
    profile: profileRes.data,
    enrollment: enrollRes.data,
    application: appRes.data,
  });
}
