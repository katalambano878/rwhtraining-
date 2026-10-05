import { createClient } from "@/lib/db";
import { ExportRosterButton } from "../ClientButtons";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Banknote, CreditCard, Users } from "lucide-react";
import { StudentsTable } from "./StudentsClient";
import { computePaymentBasedMoneyStats, computePerStudentPaid, filterRealEnrollments } from "@/lib/admin-metrics";
import {
    filterByCohortId,
    getActiveCohortId,
    normalizeCohortFilter,
    resolveCohortScopeId,
    type CohortFilterValue,
} from "@/lib/admin-cohort";
import { CohortScopePicker } from "@/components/admin/CohortScopePicker";

export const revalidate = 0;

async function getStudentsData(cohortFilter: CohortFilterValue) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) return null;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const [enrollmentsRes, profilesRes, paymentsRes, cohortsRes, appsRes] = await Promise.all([
        supabase.from("enrollments").select("*, applications(id, email, phone, city, first_name, last_name, tier, amount_ghs, occupation, experience, reason, payment_status, payment_reference, created_at)"),
        supabase.from("profiles").select("*").eq("role", "STUDENT"),
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
        supabase.from("cohorts").select("*").order("start_date", { ascending: false }),
        supabase.from("applications").select("id, cohort_id, payment_reference"),
    ]);

    const cohorts = cohortsRes.data || [];
    const activeCohortId = getActiveCohortId(cohorts);
    const scopeCohortId = resolveCohortScopeId(cohortFilter, activeCohortId);
    const allEnrollments = enrollmentsRes.data || [];
    const allStudents = profilesRes.data || [];
    const allPayments = paymentsRes.data || [];
    const applications = filterByCohortId(appsRes.data || [], scopeCohortId);
    const enrollments = filterByCohortId(allEnrollments, scopeCohortId);
    const appIds = new Set(applications.map((app: any) => app.id));
    const paymentRefs = new Set(applications.map((app: any) => app.payment_reference).filter(Boolean));

    const payments = allPayments.filter((payment: any) => {
        if (payment.application_id && appIds.has(payment.application_id)) return true;
        if (payment.reference && paymentRefs.has(payment.reference)) return true;
        return false;
    });

    const students = allStudents.filter((student: any) =>
        enrollments.some((enrollment: any) => enrollment.user_id === student.id)
    );

    const lastSignInMap: Record<string, string | null> = {};
    try {
        const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 500 });
        if (authData?.users) {
            for (const u of authData.users) {
                if (u.last_sign_in_at) lastSignInMap[u.id] = u.last_sign_in_at;
            }
        }
    } catch {}

    const realEnrollments = filterRealEnrollments(enrollments);
    const money = computePaymentBasedMoneyStats(realEnrollments, payments);
    const perStudentPaid = computePerStudentPaid(realEnrollments, payments);

    return { enrollments: realEnrollments, students, payments, lastSignInMap, money, perStudentPaid: Object.fromEntries(perStudentPaid), cohorts, activeCohortId };
}

export default async function ActiveStudentsPage({
    searchParams,
}: {
    searchParams?: Promise<{ cohort?: string }>;
}) {
    const params = (await searchParams) || {};
    const data = await getStudentsData(normalizeCohortFilter(params.cohort));

    if (!data) {
        return <div className="p-10 text-slate-900 font-bold">Error loading students data.</div>;
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-slate-900 leading-none">Active Students</h1>
                    <p className="text-slate-500 text-[15px] font-medium">Enrolled members with payment confirmation and credentials.</p>
                </div>
                <div className="flex items-center gap-3">
                    <CohortScopePicker cohorts={data.cohorts} activeCohortId={data.activeCohortId} />
                    <ExportRosterButton students={data.students} enrollments={data.enrollments} />
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: "Student Accounts", value: data.students.length.toString(), icon: Users, color: "blue" },
                    { title: "Total Collected", value: `GHS ${data.money.totalCollected.toLocaleString()}`, icon: Banknote, color: "emerald" },
                    { title: "Outstanding", value: `GHS ${data.money.outstandingBalance.toLocaleString()}`, icon: CreditCard, color: "amber" },
                    { title: "Fully Paid", value: data.money.fullyPaidCount.toString(), icon: GraduationCap, color: "purple" },
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

            <StudentsTable
                students={data.students}
                enrollments={data.enrollments}
                payments={data.payments}
                lastSignInMap={data.lastSignInMap}
                perStudentPaid={data.perStudentPaid}
            />
        </div>
    );
}
