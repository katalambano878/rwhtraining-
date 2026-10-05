export type CohortFilterValue = "active" | "all" | string;

export type CohortLike = {
  id: string;
  name?: string | null;
  is_active?: boolean | null;
  start_date?: string | null;
  capacity?: number | null;
};

export function normalizeCohortFilter(raw?: string | null): CohortFilterValue {
  if (!raw) return "active";
  if (raw === "active" || raw === "all") return raw;
  return raw;
}

export function getActiveCohortId(cohorts: CohortLike[]): string | null {
  return cohorts.find((cohort) => cohort.is_active)?.id || null;
}

export function resolveCohortScopeId(
  filter: CohortFilterValue,
  activeCohortId: string | null
): string | null {
  if (filter === "all") return null;
  if (filter === "active") return activeCohortId;
  return filter || null;
}

export function filterByCohortId(rows: any, cohortId: string | null): any[] {
  const list: any[] = Array.isArray(rows) ? rows : [];
  if (!cohortId) return list;
  return list.filter((row) => row?.cohort_id === cohortId);
}
