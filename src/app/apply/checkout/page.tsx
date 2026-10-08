"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Lock, Loader2, XCircle, Clock, Phone } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function CheckoutDisplay() {
    const searchParams = useSearchParams();
    const amount = searchParams.get("amount") || "500";
    const ref = searchParams.get("ref") || "";
    const gateway = searchParams.get("gateway") || "zoe";
    const initialStatus = searchParams.get("status") || "pending";
    const returnPath = searchParams.get("returnPath") || "/";
    const isPaystack = gateway === "paystack";
    const gatewayLabel = isPaystack ? "Paystack" : gateway === "moolre" ? "Moolre" : "Zoe Pay";

    const [paymentStatus, setPaymentStatus] = useState(initialStatus);
    const [checking, setChecking] = useState(false);
    const [pollCount, setPollCount] = useState(0);

    const verifyPayment = useCallback(async () => {
        if (!ref) return;
        setChecking(true);
        try {
            const res = await fetch(`/api/payments/verify?ref=${ref}`);
            const data = await res.json();

            if (data.status === "SUCCESS") {
                setPaymentStatus("success");
            } else if (data.status === "FAILED") {
                setPaymentStatus("failed");
            } else {
                setPaymentStatus("pending");
            }
        } catch {
            console.error("Failed to verify payment");
        } finally {
            setChecking(false);
        }
    }, [ref]);

    // Auto-poll every 5 seconds while pending (max 60 polls = 5 minutes)
    useEffect(() => {
        if (paymentStatus !== "pending" || pollCount >= 60) return;

        const interval = setInterval(() => {
            verifyPayment();
            setPollCount((prev) => prev + 1);
        }, 5000);

        return () => clearInterval(interval);
    }, [paymentStatus, pollCount, verifyPayment]);

    return (
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 w-full max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            {/* Top Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Payment Gateway</h2>
                    {ref && (
                        <p className="text-slate-500 text-sm">
                            Ref: <span className="font-mono text-slate-700">{ref}</span>
                        </p>
                    )}
                </div>
                <div className="h-10 w-auto bg-slate-50 p-2 rounded-lg flex items-center gap-2 border border-slate-200">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold font-mono tracking-widest uppercase text-slate-700">
                        {gatewayLabel}
                    </span>
                </div>
            </div>

            {/* Amount Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 flex justify-between items-center">
                <div>
                    <p className="text-slate-500 text-sm mb-1 uppercase tracking-wide font-bold">
                        Total Due
                    </p>
                    <div className="text-4xl font-extrabold text-blue-600">GHS {amount}.00</div>
                </div>
                <Phone className="w-12 h-12 text-blue-200" />
            </div>

            {/* Payment Status */}
            {paymentStatus === "pending" && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center">
                        <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Awaiting Payment Approval
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        {isPaystack
                            ? "Complete your payment on the secure page, or we are verifying your transaction."
                            : "If you approved the payment on your phone, hold on while we confirm it. If you haven't paid yet, approve the prompt on your device."}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-6">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking payment status automatically...
                    </div>
                    <Button
                        onClick={verifyPayment}
                        disabled={checking}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-12"
                    >
                        {checking ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Check Payment Status"
                        )}
                    </Button>
                </div>
            )}

            {paymentStatus === "success" && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Payment Successful!
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        Your payment of <strong className="text-slate-900">GHS {amount}</strong> has been
                        confirmed. Your seat in the 2026 Elite Masterclass is now secured.
                    </p>
                    <Link href={returnPath}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 h-14 text-base">
                            {returnPath === "/" ? "Return to Homepage" : "Return to Dashboard"}
                        </Button>
                    </Link>
                </div>
            )}

            {(paymentStatus === "failed" || paymentStatus === "error") && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Payment Failed
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        We could not process your payment. This may be due to insufficient
                        funds, a network timeout, or a declined transaction. Please try again.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/apply">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 h-12">
                                Try Again
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={verifyPayment}
                            disabled={checking}
                            className="border-slate-300 text-slate-700 font-bold rounded-xl px-8 h-12"
                        >
                            {checking ? "Checking..." : "Re-check Status"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Security Footer */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium border-t border-slate-100 pt-6">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Payments processed securely via {gatewayLabel}.
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center animate-in fade-in duration-700 py-12 px-4">
            <Suspense
                fallback={
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-slate-500">Loading Payment Gateway...</p>
                    </div>
                }
            >
                <CheckoutDisplay />
            </Suspense>
        </div>
    );
}
