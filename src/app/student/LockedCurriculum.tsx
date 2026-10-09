"use client";

import { Lock } from "lucide-react";
import { ClassCountdown } from "@/components/student/ClassCountdown";

const LOCKED_MODULES = [
  { label: "Master Reference", detail: "Tools, commands, and prompts" },
  { label: "Week 1", detail: "Visual Decomposition" },
  { label: "Week 2", detail: "Multi-Page Architecture" },
  { label: "Week 3", detail: "Systems & Integration" },
  { label: "Week 4", detail: "The Final Deployment" },
];

export function LockedCurriculum({ startsAt }: { startsAt: string }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Curriculum</h1>
        <p className="text-gray-400 text-[15px]">Your modules are locked until the first class.</p>
      </div>
      <ClassCountdown startsAt={startsAt} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LOCKED_MODULES.map((module) => (
          <div key={module.label} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#121212] p-5 text-left opacity-80">
            <div className="p-3 rounded-xl bg-white/5 text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white text-[14px]">{module.label}</h3>
              <p className="text-[12px] text-gray-500">{module.detail}</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Locked</span>
          </div>
        ))}
      </div>
    </div>
  );
}
