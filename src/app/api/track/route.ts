import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db";

function parseDevice(ua: string): string {
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

function parseBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Firefox/i.test(ua)) return "Firefox";
  return "Other";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = body.path || "/";
    const referrer = body.referrer || null;

    const ua = request.headers.get("user-agent") || "";
    const device = parseDevice(ua);
    const browser = parseBrowser(ua);

    const country = request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") || null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("page_views").insert({
      path,
      referrer,
      country,
      device,
      browser,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
