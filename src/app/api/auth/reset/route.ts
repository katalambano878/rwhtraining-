import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "").trim();
  const password = String(body.password || "").trim();
  if (!token) {
    return NextResponse.json({ error: "This reset link is invalid." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const updated = await resetPasswordWithToken(token, password);
  if (!updated) {
    return NextResponse.json(
      { error: "This reset link has expired. Request a new one from the sign-in page." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
