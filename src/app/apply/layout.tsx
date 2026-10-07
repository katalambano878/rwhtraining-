import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply Now — Elite Web Development Masterclass",
  description:
    "Apply for the October 2026 Elite 4-Week Web Development Masterclass. No experience needed. GHS 1,000 total (promotional price), paid in full. Professional Diploma, 1-month internship, and hybrid delivery. Accra, Ghana.",
  alternates: {
    canonical: "https://remoteworkhub.org/apply",
  },
  openGraph: {
    title: "Apply Now — Remote Work Hub Masterclass",
    description:
      "Apply for the 4-week intensive web development masterclass starting October 19, 2026. GHS 1,000 promotional price. Professional Diploma, 1-month internship, and hybrid format.",
    url: "https://remoteworkhub.org/apply",
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
