import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { MoolreAdapter, type MomoNetwork, type PaymentTier } from "@/lib/moolre-adapter";
import { PaystackAdapter } from "@/lib/paystack-adapter";

/**
 * POST /api/student/pay-balance
 * Initiates a balance payment via Moolre (Mobile Money) or Paystack (Card).
 * Body: { gateway: "moolre" | "paystack" }
 * Authenticated via Bearer token (student's Supabase access token).
 */
export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        const body = await request.json().catch(() => ({}));
        const gateway: "moolre" | "paystack" = body.gateway === "paystack" ? "paystack" : "moolre";

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // Get approved application
        const { data: application } = await supabase
            .from("applications")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "APPROVED")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (!application) {
            return NextResponse.json({ error: "No approved application found" }, { status: 404 });
        }

        // Get enrollment with outstanding balance
        const { data: enrollment } = await supabase
            .from("enrollments")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (!enrollment || Number(enrollment.balance_due) <= 0) {
            return NextResponse.json({ error: "No outstanding balance" }, { status: 400 });
        }

        const balanceDue = Number(enrollment.balance_due);
        const reference = MoolreAdapter.generateReference();
        const phone = application.phone || "";
        const email = user.email || application.email;
        const firstName = application.first_name || "";
        const lastName = application.last_name || "";

        let gatewayRes;

        if (gateway === "paystack") {
            // Save payment record for Paystack
            await supabase.from("payments").insert({
                reference,
                email,
                phone,
                first_name: firstName,
                last_name: lastName,
                network: "CARD",
                amount_ghs: balanceDue,
                tier: application.tier || "50",
                gateway: "paystack",
                payment_type: "balance",
                application_id: application.id,
                status: "PENDING",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            gatewayRes = await PaystackAdapter.initializeTransaction({
                email,
                amount_ghs: balanceDue,
                first_name: firstName,
                last_name: lastName,
                reference,
                returnPath: "/student",
            });
        } else {
            // Detect MoMo network from phone prefix (Ghana)
            const cleanPhone = phone.replace(/\s+/g, "").replace(/^\+233/, "0").replace(/^233/, "0");
            let network: MomoNetwork = "MTN";
            if (cleanPhone.startsWith("020") || cleanPhone.startsWith("050")) network = "TELECEL";
            else if (cleanPhone.startsWith("026") || cleanPhone.startsWith("056") || cleanPhone.startsWith("027") || cleanPhone.startsWith("057")) network = "AIRTELTIGO";

            // Save payment record for Moolre
            await supabase.from("payments").insert({
                reference,
                email,
                phone,
                first_name: firstName,
                last_name: lastName,
                network,
                amount_ghs: balanceDue,
                tier: application.tier || "50",
                gateway: "moolre",
                payment_type: "balance",
                application_id: application.id,
                status: "PENDING",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            gatewayRes = await MoolreAdapter.initializeTransaction({
                email,
                amount_ghs: balanceDue,
                tier: (application.tier || "50") as PaymentTier,
                phone,
                network,
                first_name: firstName,
                last_name: lastName,
                reference,
                returnPath: "/student",
            });
        }

        if (!gatewayRes.checkout_url || gatewayRes.status === "FAILED") {
            return NextResponse.json({ error: gatewayRes.message || "Payment initialization failed" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            checkout_url: gatewayRes.checkout_url,
            reference,
            amount: balanceDue,
        });
    } catch (error) {
        console.error("[Pay Balance] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
