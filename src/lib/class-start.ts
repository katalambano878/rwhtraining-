/** First class of the October 2026 cohort. Ghana is GMT, so this is 8:00 AM local. */
export const FIRST_CLASS_AT = "2026-10-19T08:00:00.000Z";

export function classHasStarted(startsAt: string, now = Date.now()): boolean {
  const target = new Date(startsAt).getTime();
  if (!Number.isFinite(target)) return false;
  return now >= target;
}
