import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db";
import { PaystackAdapter } from "@/lib/paystack-adapter";
import { createZoeCheckout, generateReference, toGhPhone } from "@/lib/zoe-pay";

/**
 * POST /api/student/pay-balance
 * Initiates a balance payment via Zoe Pay (Mobile Money) or Paystack (Card).
 * Body: { gateway: "zoe" | "paystack" }
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
        const gateway: "zoe" | "paystack" = body.gateway === "paystack" ? "paystack" : "zoe";

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
        const reference = generateReference();
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
            const zoePhone = toGhPhone(phone);
            if (!zoePhone) {
                return NextResponse.json(
                    { error: "Your profile phone number is not a valid Ghana number. Please contact support." },
                    { status: 400 },
                );
            }

            // Save payment record for Zoe Pay
            await supabase.from("payments").insert({
                reference,
                email,
                phone,
                first_name: firstName,
                last_name: lastName,
                network: "MOMO",
                amount_ghs: balanceDue,
                tier: application.tier || "50",
                gateway: "zoe",
                payment_type: "balance",
                application_id: application.id,
                status: "PENDING",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkhub.org";

            try {
                const checkout = await createZoeCheckout({
                    amountGhs: balanceDue,
                    clientReference: reference,
                    description: "Remote Work Hub Masterclass balance payment",
                    customer: {
                        name: `${firstName} ${lastName}`.trim() || email,
                        email,
                        phone: zoePhone,
                    },
                    returnUrl: `${appUrl}/apply/checkout?ref=${reference}&amount=${balanceDue}&gateway=zoe&returnPath=${encodeURIComponent("/student")}`,
                });
                gatewayRes = {
                    checkout_url: checkout.checkoutUrl,
                    status: "PENDING" as const,
                    message: "Payment initiated.",
                };
            } catch (error) {
                console.error("[Pay Balance] Zoe checkout error:", error);
                gatewayRes = {
                    checkout_url: null,
                    status: "FAILED" as const,
                    message: "Could not start the payment. Please try again.",
                };
            }
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
