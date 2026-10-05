import { createClient } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Users, UserX, Phone } from "lucide-react";
import { MarketingClient } from "./MarketingClient";
import {
    getActiveCohortId,
    normalizeCohortFilter,
    resolveCohortScopeId,
    type CohortFilterValue,
} from "@/lib/admin-cohort";
import { CohortScopePicker } from "@/components/admin/CohortScopePicker";

export const revalidate = 0;

async function getMarketingData() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) return null;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [appsRes, enrollmentsRes, cohortsRes] = await Promise.all([
        supabase.from("applications").select("id, first_name, last_name, email, phone, city, tier, cohort_id, payment_status, status, is_unfinished, created_at").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("application_id"),
        supabase.from("cohorts").select("*").order("start_date", { ascending: false }),
    ]);

    const allApps = appsRes.data || [];
    const enrolledAppIds = new Set((enrollmentsRes.data || []).map((e: any) => e.application_id));
    const cohorts = cohortsRes.data || [];
    const activeCohortId = getActiveCohortId(cohorts);

    const nonEnrolledLeads = allApps.filter((app: any) => {
        if (enrolledAppIds.has(app.id)) return false;
        if (app.cohort_id === activeCohortId && app.payment_status === "PAID") return false;
        if (!app.phone && !app.email) return false;
        return true;
    });

    const withPhone = nonEnrolledLeads.filter((l: any) => l.phone?.trim());
    const withEmail = nonEnrolledLeads.filter((l: any) => l.email?.trim());

    return {
        leads: nonEnrolledLeads,
        leadsWithPhone: withPhone.length,
        leadsWithEmail: withEmail.length,
        totalLeads: nonEnrolledLeads.length,
        cohorts,
        activeCohortId,
        activeCohortName: cohorts.find((c: any) => c.id === activeCohortId)?.name || "Current Cohort",
    };
}

export default async function MarketingPage() {
    const data = await getMarketingData();

    if (!data) {
        return <div className="p-10 text-slate-900 font-bold">Error loading marketing data.</div>;
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-slate-900 leading-none">Marketing</h1>
                    <p className="text-slate-500 text-[15px] font-medium">Re-engage warm leads from previous cohorts with targeted SMS campaigns.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { title: "Non-Enrolled Leads", value: data.totalLeads.toString(), icon: Users, color: "blue" },
                    { title: "With Phone Number", value: data.leadsWithPhone.toString(), icon: Phone, color: "emerald" },
                    { title: "With Email", value: data.leadsWithEmail.toString(), icon: Megaphone, color: "violet" },
                ].map((stat, i) => (
                    <Card key={i} className="bg-white border-slate-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                                <div className={`p-2 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100/50`}>
                                    <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                                </div>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <MarketingClient
                leads={data.leads}
                activeCohortName={data.activeCohortName}
            />
        </div>
    );
}
