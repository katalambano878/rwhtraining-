import Link from "next/link";

const STEPS = [
  { key: "drafts", href: "/admin/drafts", label: "Drafts", hint: "Started the form, did not submit" },
  { key: "applications", href: "/admin/applications", label: "Applications", hint: "Submitted, not enrolled yet" },
  { key: "students", href: "/admin/students", label: "Students", hint: "Enrolled" },
] as const;

export function PipelineNote({
  current,
  counts,
}: {
  current?: "drafts" | "applications" | "students";
  counts?: Partial<Record<(typeof STEPS)[number]["key"], number>>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {STEPS.map((step, index) => {
        const active = step.key === current;
        const count = counts?.[step.key];
        return (
          <Link
            key={step.key}
            href={step.href}
            className={`rounded-2xl border px-4 py-3 transition-colors ${
              active
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className={`text-[12px] font-extrabold uppercase tracking-widest ${active ? "text-white" : "text-slate-400"}`}>
                {index + 1}. {step.label}
              </p>
              {typeof count === "number" && (
                <span className={`text-lg font-extrabold ${active ? "text-white" : "text-slate-900"}`}>{count}</span>
              )}
            </div>
            <p className={`text-[13px] font-medium mt-1 ${active ? "text-slate-200" : "text-slate-500"}`}>{step.hint}</p>
          </Link>
        );
      })}
    </div>
  );
}
