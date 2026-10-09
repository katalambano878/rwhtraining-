"use client";

import { useEffect, useState } from "react";
import { classHasStarted } from "@/lib/class-start";

export function useClassCountdown(startsAt: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const target = new Date(startsAt).getTime();
  const remaining = Number.isFinite(target) ? Math.max(0, target - now) : 0;
  const totalSeconds = Math.floor(remaining / 1000);

  return {
    open: classHasStarted(startsAt, now),
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function formatClassDate(startsAt: string): string {
  const date = new Date(startsAt);
  if (!Number.isFinite(date.getTime())) return "the first day of class";
  return date.toLocaleString("en-GH", {
    timeZone: "Africa/Accra",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function ClassCountdown({ startsAt }: { startsAt: string }) {
  const time = useClassCountdown(startsAt);
  if (time.open) return null;

  const units = [
    { value: String(time.days), label: "Days" },
    { value: pad(time.hours), label: "Hours" },
    { value: pad(time.minutes), label: "Minutes" },
    { value: pad(time.seconds), label: "Seconds" },
  ];

  return (
    <div className="rounded-2xl border border-[#2563EB]/30 bg-[#121212] p-6 md:p-8">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#2563EB]">First class</p>
      <h2 className="mt-2 text-xl md:text-2xl font-extrabold text-white">{formatClassDate(startsAt)}</h2>
      <p className="mt-2 text-[14px] text-gray-400">Modules and course materials unlock when class begins.</p>
      <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((unit) => (
          <div key={unit.label} className="rounded-xl border border-white/10 bg-black/40 px-2 py-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold tabular-nums text-white">{unit.value}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
