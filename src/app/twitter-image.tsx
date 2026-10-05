import { ImageResponse } from "next/og";

export const alt = "Remote Work Hub — 2026 Elite Web Development Masterclass";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
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

        <div
          style={{
            height: 6,
            background: "linear-gradient(90deg, #2563EB 0%, #3b82f6 50%, #60a5fa 100%)",
            width: "100%",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 72px",
            flex: 1,
            position: "relative",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div
              style={{
                width: 48,
                height: 48,
                background: "#2563EB",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 900,
                color: "white",
              }}
            >
              R
            </div>
            <span style={{ color: "#ffffff", fontSize: 22, fontWeight: 800 }}>Remote Work Hub</span>
          </div>

          <span style={{ color: "#3b82f6", fontSize: 15, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" as const, marginBottom: 12 }}>
            2026 Elite Masterclass
          </span>
          <span style={{ color: "#ffffff", fontSize: 52, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.15, marginBottom: 8 }}>
            Become a Professional
          </span>
          <span style={{ color: "#2563EB", fontSize: 52, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.15, marginBottom: 24 }}>
            Web Developer
          </span>
          <span style={{ color: "#94a3b8", fontSize: 20, fontWeight: 600, maxWidth: 700 }}>
            Professional Diploma. 1-month internship. Hybrid format. Top 2 get hired by Doctor Barns Tech.
          </span>

          <div style={{ display: "flex", gap: 28, marginTop: 36 }}>
            {["Starts October 19", "GHS 1,000", "Accra, Ghana"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "flex" }} />
                <span style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 700 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
