import { createClient } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, CreditCard, Globe, Shield, Database } from "lucide-react";
import { SettingsClient } from "./SettingsClient";

export const revalidate = 0;

async function getSettingsData() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) return null;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [cohortsRes, adminsRes, configRes] = await Promise.all([
        supabase.from("cohorts").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").in("role", ["ADMIN", "SUPER_ADMIN"]),
        supabase.from("cohorts").select("*").eq("is_active", true).limit(1).single()
    ]);

    return {
        cohorts: cohortsRes.data || [],
        admins: adminsRes.data || [],
        activeCohort: configRes.data,
    };
}

export default async function SettingsPage() {
    const data = await getSettingsData();

    if (!data) {
        return <div className="p-10 text-slate-900 font-bold">Error loading settings.</div>;
    }

    const systemInfo = [
        { label: "Database", value: "Supabase PostgreSQL", icon: Database, status: "Connected" },
        { label: "Payment (MoMo)", value: "Moolre API", icon: CreditCard, status: process.env.MOOLRE_API_KEY ? "Active" : "Not Configured" },
        { label: "Payment (Card)", value: "Paystack API", icon: CreditCard, status: process.env.PAYSTACK_SECRET_KEY ? "Active" : "Not Configured" },
        { label: "Email Service", value: "Resend", icon: Globe, status: process.env.RESEND_API_KEY ? "Active" : "Not Configured" },
        { label: "Auth Provider", value: "Supabase Auth", icon: Shield, status: "Active" },
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-slate-900 leading-none">System Settings</h1>
                    <p className="text-slate-500 text-[15px] font-medium">Cohort management, admin users, walk-in enrollment, and platform configuration.</p>
                </div>
            </div>

            {/* Interactive management sections */}
            <SettingsClient cohorts={data.cohorts} admins={data.admins} activeCohort={data.activeCohort} />

            {/* Pricing Configuration */}
            <Card className="border-slate-200/60 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><CreditCard className="w-4 h-4" /></div>
                        Pricing Tiers
                    </CardTitle>
                    <CardDescription className="text-[13px] text-slate-500 font-medium">Current pricing configuration for the masterclass</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { tier: "20%", amount: "GHS 200", desc: "Deposit — secures seat", color: "blue" },
                            { tier: "50%", amount: "GHS 500", desc: "Half payment — popular", color: "purple" },
                            { tier: "100%", amount: "GHS 1,000", desc: "Full payment — all access", color: "emerald" },
                        ].map((t) => (
                            <div key={t.tier} className={`p-5 rounded-xl border border-${t.color}-200/60 bg-${t.color}-50/30`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t.tier} Tier</span>
                                </div>
                                <div className={`text-2xl font-extrabold text-${t.color}-700 mb-1`}>{t.amount}</div>
                                <p className="text-[12px] text-slate-500 font-medium">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-slate-200/60 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100"><Settings className="w-4 h-4 text-slate-600" /></div>
                        System Status
                    </CardTitle>
                    <CardDescription className="text-[13px] text-slate-500 font-medium">Connected services and integrations</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="space-y-3">
                        {systemInfo.map((info) => (
                            <div key={info.label} className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-slate-50">
                                        <info.icon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-900">{info.label}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{info.value}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-widest ${
                                    info.status === "Active" || info.status === "Connected"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                        : "bg-amber-50 text-amber-700 border-amber-200/60"
                                }`}>
                                    {info.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
