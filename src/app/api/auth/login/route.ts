import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "").trim();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid login credentials" }, { status: 401 });
  }

  const sessionUser = { id: user.id, email: user.email, role: user.role };
  const token = await signSession(sessionUser);
  const response = NextResponse.json({ user: sessionUser });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
