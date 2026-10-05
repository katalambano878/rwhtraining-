/** Total masterclass program fee (Ghana Cedis) — October 2026 promotional price. */
export const COURSE_TOTAL_GHS = 1000;

/** Initial checkout amount for each payment tier (20% / 50% / 100% of {@link COURSE_TOTAL_GHS}). */
export function tierInitialAmountGhs(tier: string): number {
    if (tier === "20") return 200;
    if (tier === "100") return 1000;
    return 500;
}
