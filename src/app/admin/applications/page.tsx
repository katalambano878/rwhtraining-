import { createClient } from "@/lib/db";
import { ApplicationsListWithDetail } from "../components/ApplicationsListWithDetail";
import { ExportReportButton, ExportUnfinishedButton } from "../ClientButtons";
import { splitApplicationsForAdmin } from "@/lib/admin-applications";
import { COURSE_TOTAL_GHS } from "@/lib/pricing";
import {
    filterByCohortId,
    getActiveCohortId,
    normalizeCohortFilter,
    resolveCohortScopeId,
    type CohortFilterValue,
} from "@/lib/admin-cohort";
import { CohortScopePicker } from "@/components/admin/CohortScopePicker";
import { PipelineNote } from "../components/PipelineNote";

export const revalidate = 0;

async function getApplicationsData(cohortFilter: CohortFilterValue) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) return null;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const [appsRes, enrollmentsRes, cohortsRes, paymentsRes] = await Promise.all([
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("cohort_id, application_id, balance_due, applications(email, payment_reference)"),
        supabase.from("cohorts").select("*").order("start_date", { ascending: false }),
        supabase.from("payments").select("id, application_id, reference, amount_ghs, status").in("status", ["PAID", "SUCCESS"]),
    ]);

    if (appsRes.error) return null;

    const cohorts = cohortsRes.data ?? [];
    const activeCohortId = getActiveCohortId(cohorts);
    const scopeCohortId = resolveCohortScopeId(cohortFilter, activeCohortId);
    const all = filterByCohortId(appsRes.data ?? [], scopeCohortId);
    const enrollments = filterByCohortId(enrollmentsRes.data ?? [], scopeCohortId);
    const paidPayments = paymentsRes.data ?? [];
    const grouped = splitApplicationsForAdmin(all, enrollments);

    const balanceDueByApplicationId: Record<string, number> = {};
    for (const app of grouped.completedApplications) {
        const seen = new Set<string>();
        let paid = 0;
        for (const payment of paidPayments) {
            if (seen.has(payment.id)) continue;
            const matches = payment.application_id === app.id || (app.payment_reference && payment.reference === app.payment_reference);
            if (!matches) continue;
            seen.add(payment.id);
            paid += Number(payment.amount_ghs || 0);
        }
        if (app.id) balanceDueByApplicationId[app.id] = Math.max(0, COURSE_TOTAL_GHS - paid);
    }

    return {
        applications: grouped.completedApplications,
        unfinishedApps: grouped.abandonedDrafts,
        balanceDueByApplicationId,
        cohorts,
        activeCohortId,
    };
}

export default async function ApplicationsPipelinePage({
    searchParams,
}: {
    searchParams?: Promise<{ cohort?: string }>;
}) {
    const params = (await searchParams) || {};
    const data = await getApplicationsData(normalizeCohortFilter(params.cohort));

    if (!data) {
        return (
            <div className="p-10 text-slate-900 font-bold">Error loading applications.</div>
        );
    }

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-[42px] font-extrabold tracking-tight text-slate-900 leading-none">
                        Applications
                    </h1>
                    <p className="text-slate-500 text-[15px] font-medium">
                        Submitted forms that are not students yet. Enrolled people are only on the Students page.
                    </p>
                </div>
                <CohortScopePicker cohorts={data.cohorts} activeCohortId={data.activeCohortId} />
            </div>

            <PipelineNote current="applications" counts={{ applications: data.applications.length }} />

            <div>
                <ApplicationsListWithDetail
                    applications={data.applications}
                    unfinishedApps={data.unfinishedApps}
                    balanceDueByApplicationId={data.balanceDueByApplicationId}
                    ExportReportButton={<ExportReportButton applications={data.applications} />}
                    ExportUnfinishedButton={<ExportUnfinishedButton unfinishedApps={data.unfinishedApps} />}
                    hideDrafts={true}
                />
            </div>
        </div>
    );
}
