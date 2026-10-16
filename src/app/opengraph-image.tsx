import { ImageResponse } from "next/og";
import { RWH_LOGO_ON_DARK } from "@/lib/brand/og-logo";

export const alt = "Remote Work Hub — 2026 Elite Web Development Masterclass";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a192f 0%, #0f172a 40%, #1e293b 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Blue accent bar at top */}
        <div
          style={{
            height: 6,
            background: "linear-gradient(90deg, #2563EB 0%, #3b82f6 50%, #60a5fa 100%)",
            width: "100%",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 72px",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Top row: Logo + Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={RWH_LOGO_ON_DARK} width={330} height={55} alt="Remote Work Hub, by Doctor Barns Tech" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.3)",
                borderRadius: 10,
                padding: "8px 18px",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "flex" }} />
              <span style={{ color: "#93c5fd", fontSize: 13, fontWeight: 700, letterSpacing: "0.5px" }}>
                ENROLLING NOW
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
            <span style={{ color: "#3b82f6", fontSize: 16, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" as const }}>
              2026 Elite Masterclass
            </span>
            <span
              style={{
                color: "#ffffff",
                fontSize: 56,
                fontWeight: 900,
                letterSpacing: "-2px",
                lineHeight: 1.1,
              }}
            >
              Become a Professional
            </span>
            <span
              style={{
                color: "#2563EB",
                fontSize: 56,
                fontWeight: 900,
                letterSpacing: "-2px",
                lineHeight: 1.1,
              }}
            >
              Web Developer
            </span>
            <span style={{ color: "#94a3b8", fontSize: 22, fontWeight: 600, lineHeight: 1.4 }}>
              Professional Certificate. 1-month internship. Hybrid format with weekly onsite and online sessions.
            </span>
          </div>

          {/* Bottom row: Features */}
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {[
              { label: "Professional Certificate", color: "#22c55e" },
              { label: "1-Month Internship", color: "#3b82f6" },
              { label: "Top 2 Get Hired", color: "#f59e0b" },
              { label: "GHS 1,000", color: "#ffffff" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, display: "flex" }} />
                <span style={{ color: "#cbd5e1", fontSize: 15, fontWeight: 700 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
