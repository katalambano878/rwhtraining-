import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, AlertCircle, Banknote, ArrowUpRight, TrendingUp, TrendingDown, UserPlus, GraduationCap, CreditCard, Activity, Clock, ArrowRight, Zap, Target, Eye } from "lucide-react";
import { createClient } from "@/lib/db";
import { ExportReportButton, OpenRegistrationsButton } from "./ClientButtons";
import { SendMessageToStudents } from "./components/SendMessageToStudents";
import { RevenueChart, TierPieChart, GatewayPieChart, FunnelChart } from "./components/DashboardCharts";
import { computePaymentBasedMoneyStats, filterRealEnrollments } from "@/lib/admin-metrics";
import { splitApplicationsForAdmin } from "@/lib/admin-applications";
import {
    filterByCohortId,
    getActiveCohortId,
    normalizeCohortFilter,
    resolveCohortScopeId,
    type CohortFilterValue,
} from "@/lib/admin-cohort";
import { CohortScopePicker } from "@/components/admin/CohortScopePicker";
import { VisitorRangePicker } from "@/components/admin/VisitorRangePicker";
import { PipelineNote } from "./components/PipelineNote";
import { COURSE_TOTAL_GHS } from "@/lib/pricing";

export const revalidate = 0;

type VisitorRange = "day" | "week" | "month";

function normalizeVisitorRange(raw?: string): VisitorRange {
    if (raw === "day" || raw === "week" || raw === "month") return raw;
    return "week";
}

async function getAdminData(cohortFilter: CohortFilterValue, visitorRange: VisitorRange) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) return null;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [appsRes, enrollmentsRes, profilesRes, paymentsRes, cohortsRes] = await Promise.all([
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("*, applications(*)"),
        supabase.from("profiles").select("*").eq("role", "STUDENT"),
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
        supabase.from("cohorts").select("*").order("start_date", { ascending: false })
    ]);

    const allApps = appsRes.data || [];
    const allEnrollments = enrollmentsRes.data || [];
    const cohorts = cohortsRes.data || [];
    const activeCohortId = getActiveCohortId(cohorts);
    const scopeCohortId = resolveCohortScopeId(cohortFilter, activeCohortId);
    const scopedApps = filterByCohortId(allApps, scopeCohortId);
    const enrollments = filterByCohortId(allEnrollments, scopeCohortId);
    const grouped = splitApplicationsForAdmin(scopedApps, enrollments);
    const applications = grouped.completedApplications;
    const unfinishedApps = grouped.abandonedDrafts;
    const students = profilesRes.data || [];
    const payments = paymentsRes.data || [];
    const cohort = cohorts.find((c: any) => c.id === scopeCohortId) || cohorts.find((c: any) => c.is_active);

    const realEnrollments = filterRealEnrollments(enrollments);

    const appIds = new Set(scopedApps.map((app: any) => app.id));
    const paymentRefs = new Set(
        scopedApps.map((app: any) => app.payment_reference).filter(Boolean)
    );
    const scopedPayments = payments.filter((payment: any) => {
        if (payment.application_id && appIds.has(payment.application_id)) return true;
        if (payment.reference && paymentRefs.has(payment.reference)) return true;
        return false;
    });

    const enrollmentMoney = computePaymentBasedMoneyStats(realEnrollments, scopedPayments);
    const filledSeats = enrollmentMoney.enrolledCount;
    const totalCapacity = cohort?.capacity || 15;
    const paidForApp = (app: any) => {
        const seen = new Set<string>();
        return scopedPayments.reduce((sum: number, payment: any) => {
            const paid = payment.status === "PAID" || payment.status === "SUCCESS";
            const matches = payment.application_id === app.id || (app.payment_reference && payment.reference === app.payment_reference);
            if (!paid || !matches || seen.has(payment.id)) return sum;
            seen.add(payment.id);
            return sum + Number(payment.amount_ghs || 0);
        }, 0);
    };
    const unpaidApplications = applications.filter((app: any) => paidForApp(app) <= 0).length;
    const partPaidApplications = applications.filter((app: any) => {
        const paid = paidForApp(app);
        return paid > 0 && paid < COURSE_TOTAL_GHS;
    }).length;
    const paidApps = applications.filter((a: any) => paidForApp(a) > 0);
    const pendingPayments = unpaidApplications;
    const totalWhoStarted = unfinishedApps.length + applications.length + realEnrollments.length;

    const conversionRate = totalWhoStarted > 0 ? ((realEnrollments.length / totalWhoStarted) * 100).toFixed(1) : "0";
    const completionRate = totalWhoStarted > 0 ? ((applications.length / totalWhoStarted) * 100).toFixed(1) : "0";

    const totalRevenue = enrollmentMoney.totalCollected;
    const outstandingBalance = enrollmentMoney.outstandingBalance;

    const revenueByDay: { date: string; amount: number }[] = [];

    const paidPayments = scopedPayments.filter(
        (p: any) =>
            (p.status === "PAID" || p.status === "SUCCESS") &&
            p.email?.toLowerCase() !== "teststudent@remoteworkhub.org"
    );
    const dayMap = new Map<string, number>();
    paidPayments.forEach((p: any) => {
        const date = new Date(p.paid_at || p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dayMap.set(date, (dayMap.get(date) || 0) + Number(p.amount_ghs || 0));
    });
    dayMap.forEach((amount, date) => revenueByDay.push({ date, amount }));
    revenueByDay.reverse();

    const tier20 = paidApps.filter((a: any) => a.tier === "20");
    const tier50 = paidApps.filter((a: any) => a.tier === "50");
    const tier100 = paidApps.filter((a: any) => a.tier === "100");
    const tierBreakdown = [
        { name: "20% Deposit (GHS 200)", value: tier20.length, amount: tier20.reduce((s: number, a: any) => s + Number(a.amount_ghs || 0), 0) },
        { name: "50% Deposit (GHS 500)", value: tier50.length, amount: tier50.reduce((s: number, a: any) => s + Number(a.amount_ghs || 0), 0) },
        { name: "Full Payment (GHS 1,000)", value: tier100.length, amount: tier100.reduce((s: number, a: any) => s + Number(a.amount_ghs || 0), 0) },
    ];

    const moolrePayments = paidPayments.filter((p: any) => p.gateway === "moolre").length;
    const paystackPayments = paidPayments.filter((p: any) => p.gateway === "paystack").length;
    const gatewayBreakdown = [
        { name: "Moolre (MoMo)", value: moolrePayments },
        { name: "Paystack (Card)", value: paystackPayments },
    ];

    const funnelData = [
        { stage: "Drafts", count: unfinishedApps.length, color: "#94A3B8" },
        { stage: "Applications", count: applications.length, color: "#3B82F6" },
        { stage: "Students", count: realEnrollments.length, color: "#059669" },
    ];

    const recentActivity = allApps.slice(0, 8).map((app: any) => ({
        name: `${app.first_name || "Guest"} ${app.last_name || ""}`.trim(),
        email: app.email || "No email",
        action: app.is_unfinished ? "Started application" : app.payment_status === "PAID" ? "Payment confirmed" : "Submitted application",
        time: app.updated_at || app.created_at,
        type: app.is_unfinished ? "draft" : app.payment_status === "PAID" ? "paid" : "submitted",
    }));

    // Page view analytics
    const now = new Date();
    const periodStartMap: Record<VisitorRange, Date> = {
        day: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    const periodLabelMap: Record<VisitorRange, string> = {
        day: "last 24 hours",
        week: "last 7 days",
        month: "last 30 days",
    };
    const periodStart = periodStartMap[visitorRange].toISOString();

    const [periodViewsRes, totalViewsRes, topPagesRes] = await Promise.all([
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", periodStart),
        supabase.from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("page_views").select("path").gte("created_at", periodStart),
    ]);

    const periodViews = periodViewsRes.count || 0;
    const totalViews = totalViewsRes.count || 0;

    const pathCounts = new Map<string, number>();
    (topPagesRes.data || []).forEach((row: any) => {
        pathCounts.set(row.path, (pathCounts.get(row.path) || 0) + 1);
    });
    const topPages = Array.from(pathCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, views]) => ({ path, views }));

    return {
        applications, unfinishedApps, enrollments, students, payments: scopedPayments,
        totalRevenue, pendingPayments, partPaidApplications, filledSeats, totalCapacity, totalWhoStarted,
        conversionRate, completionRate, outstandingBalance,
        revenueByDay, tierBreakdown, gatewayBreakdown, funnelData, recentActivity,
        paidCount: enrollmentMoney.enrolledCount, cohort, cohorts, activeCohortId, scopeCohortId,
        analytics: { periodViews, totalViews, topPages, periodLabel: periodLabelMap[visitorRange] },
    };
}

export default async function AdminDashboardPage({
    searchParams,
}: {
    searchParams?: Promise<{ cohort?: string; visitors?: string }>;
}) {
    const params = (await searchParams) || {};
    const data = await getAdminData(
        normalizeCohortFilter(params.cohort),
        normalizeVisitorRange(params.visitors)
    );

    if (!data) return <div className="p-10 text-slate-900 font-bold">Error: Supabase config missing.</div>;

    const kpis = [
        { title: "Drafts", value: data.unfinishedApps.length.toString(), desc: "Started, not submitted", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50/50", border: "border-red-100/50", trend: null },
        { title: "Applications", value: data.applications.length.toString(), desc: `${data.pendingPayments} unpaid · ${data.partPaidApplications} part paid`, icon: Users, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100/50", trend: null },
        { title: "Students", value: data.filledSeats.toString(), desc: "Enrolled in this cohort", icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100/50", trend: null },
        { title: "Collected", value: `GHS ${data.totalRevenue.toLocaleString()}`, desc: "From payment records", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100/50", trend: null },
        { title: "Site Visitors", value: data.analytics.periodViews.toLocaleString(), desc: data.analytics.periodLabel, icon: Eye, color: "text-violet-600", bg: "bg-violet-50/50", border: "border-violet-100/50", trend: null },
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-1000">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                            {data.cohort?.name || "Cohort 2026"} — Live
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-slate-900 leading-none">Mission Control</h1>
                    <p className="text-slate-500 text-[15px] font-medium max-w-lg">Each person is in one place: a draft, an application, or a student.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <VisitorRangePicker />
                    <CohortScopePicker cohorts={data.cohorts} activeCohortId={data.activeCohortId} />
                    <ExportReportButton applications={data.applications} />
                    <OpenRegistrationsButton />
                </div>
            </div>

            <PipelineNote
                counts={{
                    drafts: data.unfinishedApps.length,
                    applications: data.applications.length,
                    students: data.filledSeats,
                }}
            />

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="bg-white border-slate-200/60 hover:border-slate-300/80 transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 rounded-2xl overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-5 pt-5">
                            <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</CardTitle>
                            <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.border} border transition-colors group-hover:bg-white`}>
                                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{kpi.value}</div>
                            <p className="text-[11px] font-semibold mt-2 text-slate-400 flex items-center gap-1">
                                {kpi.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                                {kpi.trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
                                {kpi.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Conversion + Outstanding Balance row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-0 rounded-2xl overflow-hidden text-white shadow-[0_8px_30px_-4px_rgba(37,99,235,0.3)]">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-blue-200" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200">Became students</span>
                        </div>
                        <div className="text-4xl font-extrabold tracking-tight">{data.conversionRate}%</div>
                        <p className="text-[12px] font-medium text-blue-200 mt-2">Drafts and applications who are now enrolled</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 rounded-2xl overflow-hidden text-white shadow-[0_8px_30px_-4px_rgba(245,158,11,0.3)]">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-amber-200" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-200">Still owed by students</span>
                        </div>
                        <div className="text-4xl font-extrabold tracking-tight">GHS {data.outstandingBalance.toLocaleString()}</div>
                        <p className="text-[12px] font-medium text-amber-200 mt-2">Balance left after enrollment</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 rounded-2xl overflow-hidden text-white shadow-[0_8px_30px_-4px_rgba(16,185,129,0.3)]">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-emerald-200" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">Applications not paid</span>
                        </div>
                        <div className="text-4xl font-extrabold tracking-tight">{data.pendingPayments}</div>
                        <p className="text-[12px] font-medium text-emerald-200 mt-2">{data.partPaidApplications} more have only paid part of the fee</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart + Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3 border-slate-200/60 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    <CardHeader className="px-6 pt-6 pb-2">
                        <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Banknote className="w-4 h-4" /></div>
                            Revenue Over Time
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-[13px] font-medium">Daily paid transactions (ledger view)</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <RevenueChart data={data.revenueByDay} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-slate-200/60 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardHeader className="px-6 pt-6 pb-2">
                        <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Target className="w-4 h-4" /></div>
                            Application Funnel
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-[13px] font-medium">Drafts, then applications, then students</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <FunnelChart data={data.funnelData} />
                    </CardContent>
                </Card>
            </div>

            {/* Tier Breakdown + Gateway + Capacity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-slate-200/60 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <CardTitle className="text-[15px] font-extrabold text-slate-900">Revenue by Tier</CardTitle>
                        <CardDescription className="text-[12px] text-slate-500 font-medium">Tier distribution of paid students</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <TierPieChart data={data.tierBreakdown} />
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <CardTitle className="text-[15px] font-extrabold text-slate-900">Payment Gateway Split</CardTitle>
                        <CardDescription className="text-[12px] text-slate-500 font-medium">Moolre vs Paystack usage</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <GatewayPieChart data={data.gatewayBreakdown} />
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <CardHeader className="px-6 pt-6 pb-4">
                        <CardTitle className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><UserPlus className="w-4 h-4" /></div>
                            Enrollment Snapshot
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center text-[13px] border-b border-slate-100 pb-3">
                                <span className="text-slate-500 font-medium">Enrolled now</span>
                                <span className="font-extrabold text-slate-900">{data.filledSeats}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] border-b border-slate-100 pb-3">
                                <span className="text-slate-500 font-medium">Marketing seat target</span>
                                <span className="font-extrabold text-amber-600">{data.totalCapacity}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-slate-500 font-medium">Enrollment mode</span>
                                <span className="font-extrabold text-emerald-600">Open</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Feed + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3 border-slate-200/60 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
                    <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-slate-100"><Activity className="w-4 h-4 text-slate-600" /></div>
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100/80">
                            {data.recentActivity.length > 0 ? data.recentActivity.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-extrabold border ${
                                            item.type === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
                                            item.type === "draft" ? "bg-red-50 text-red-600 border-red-200/60" :
                                            "bg-blue-50 text-blue-600 border-blue-200/60"
                                        }`}>
                                            {item.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-900">{item.name}</p>
                                            <p className="text-[11px] text-slate-400 font-medium">{item.action}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                        <Clock className="w-3 h-3" />
                                        {item.time ? new Date(item.time).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 text-[13px] text-slate-400 font-medium">No recent activity</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200/60 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden h-fit">
                    <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-lg font-extrabold text-slate-900">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {[
                            { href: "/admin/drafts", label: "Abandoned Drafts", desc: `${data.unfinishedApps.length} started and stopped`, icon: AlertCircle, color: "red" },
                            { href: "/admin/applications", label: "Applications", desc: `${data.applications.length} submitted, not enrolled`, icon: Users, color: "blue" },
                            { href: "/admin/students", label: "Students", desc: `${data.filledSeats} enrolled`, icon: GraduationCap, color: "amber" },
                            { href: "/admin/payments", label: "Payment Ledger", desc: `${data.payments.length} transactions`, icon: CreditCard, color: "emerald" },
                        ].map((action) => (
                            <Link key={action.href} href={action.href} className={`flex items-center justify-between p-4 rounded-xl border border-slate-200/60 hover:border-${action.color}-200 hover:bg-${action.color}-50/30 transition-all group`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-${action.color}-50 text-${action.color}-600 group-hover:bg-${action.color}-600 group-hover:text-white transition-colors`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-[13px]">{action.label}</h4>
                                        <p className="text-[11px] text-slate-500 font-medium">{action.desc}</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </Link>
                        ))}

                        <SendMessageToStudents paidCount={data.paidCount} />
                    </CardContent>
                </Card>

                {/* Top Pages (Selected Range) */}
                <Card className="border-slate-200/60 bg-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden h-fit">
                    <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-violet-50/50">
                        <CardTitle className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600"><Eye className="w-4 h-4" /></div>
                            Top Pages ({data.analytics.periodLabel})
                        </CardTitle>
                        <CardDescription className="text-[12px] text-slate-500 font-medium">{data.analytics.periodViews.toLocaleString()} views in {data.analytics.periodLabel}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100/80">
                            {data.analytics.topPages.length > 0 ? data.analytics.topPages.map((page: any, i: number) => (
                                <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-extrabold text-slate-400 w-5">{i + 1}.</span>
                                        <span className="text-[13px] font-bold text-slate-900 font-mono">{page.path}</span>
                                    </div>
                                    <span className="text-[12px] font-extrabold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-md">{page.views}</span>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-[13px] text-slate-400 font-medium">No page views tracked yet</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                </div>
            </div>
        </div>
    );
}
