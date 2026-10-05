import { createClient } from "@/lib/db";
import { ApplicationsListWithDetail } from "../components/ApplicationsListWithDetail";
import { ExportReportButton, ExportUnfinishedButton } from "../ClientButtons";
import { splitApplicationsForAdmin } from "@/lib/admin-applications";
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
    const [appsRes, enrollmentsRes, cohortsRes] = await Promise.all([
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("cohort_id, application_id, applications(email)"),
        supabase.from("cohorts").select("*").order("start_date", { ascending: false }),
    ]);

    if (appsRes.error) return null;

    const cohorts = cohortsRes.data ?? [];
    const activeCohortId = getActiveCohortId(cohorts);
    const scopeCohortId = resolveCohortScopeId(cohortFilter, activeCohortId);
    const all = filterByCohortId(appsRes.data ?? [], scopeCohortId);
    const enrollments = filterByCohortId(enrollmentsRes.data ?? [], scopeCohortId);
    const grouped = splitApplicationsForAdmin(all, enrollments);

    return {
        applications: grouped.completedApplications,
        unfinishedApps: grouped.abandonedDrafts,
        cohorts,
        activeCohortId,
    };
}

export default async function AbandonedDraftsPage({
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
                        Abandoned Drafts
                    </h1>
                    <p className="text-slate-500 text-[15px] font-medium">
                        People who started the form and stopped. They are not on Applications or Students.
                    </p>
                </div>
                <CohortScopePicker cohorts={data.cohorts} activeCohortId={data.activeCohortId} />
            </div>

            <PipelineNote current="drafts" counts={{ drafts: data.unfinishedApps.length }} />

            <div>
                <ApplicationsListWithDetail
                    applications={data.applications}
                    unfinishedApps={data.unfinishedApps}
                    ExportReportButton={<ExportReportButton applications={data.applications} />}
                    ExportUnfinishedButton={<ExportUnfinishedButton unfinishedApps={data.unfinishedApps} />}
                    hidePipeline={true}
                />
            </div>
        </div>
    );
}
