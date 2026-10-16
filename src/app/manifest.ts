import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Remote Work Hub — Elite Web Development Masterclass",
    short_name: "Remote Work Hub",
    description:
      "Become a professional web developer in 4 weeks. Professional Certificate, 1-month internship, and hybrid delivery with weekly onsite and online sessions.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#2563EB",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
