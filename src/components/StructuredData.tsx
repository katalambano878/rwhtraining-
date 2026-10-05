import { COURSE_TOTAL_GHS } from "@/lib/pricing";

const APP_URL = "https://remoteworkhub.org";
const FEE_STRING = String(COURSE_TOTAL_GHS);

const organizationSchema = {
  "@type": "Organization",
  "@id": `${APP_URL}/#organization`,
  name: "Doctor Barns Tech",
  alternateName: "Remote Work Hub",
  url: APP_URL,
  logo: {
    "@type": "ImageObject",
    url: `${APP_URL}/icon`,
    width: 180,
    height: 180,
  },
  sameAs: [
    "https://twitter.com/remoteworkhub",
    "https://www.facebook.com/remoteworkhub",
    "https://www.linkedin.com/company/remoteworkhub",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+233209636158",
    contactType: "customer service",
    areaServed: "GH",
    availableLanguage: "English",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "111 Newtown RD",
    addressLocality: "Accra Newtown",
    addressCountry: "GH",
  },
};

const courseSchema = {
  "@type": "Course",
  "@id": `${APP_URL}/#course`,
  name: "2026 Elite Web Development & SaaS Masterclass",
  description:
    "An intensive 4-week hybrid web development masterclass in Accra, Ghana with 1 onsite and 2 online meetings weekly. Learn to build production-ready web applications, e-commerce platforms, dashboards, and SaaS products. Includes a 1-month internship at Doctor Barns Tech.",
  url: `${APP_URL}/apply`,
  provider: { "@id": `${APP_URL}/#organization` },
  courseCode: "RWH-2026-ELITE",
  educationalLevel: "Beginner to Professional",
  teaches: [
    "Full-stack web development",
    "Next.js and React",
    "Supabase and database architecture",
    "Payment integration (Paystack, Moolre)",
    "E-commerce development",
    "Dashboard and admin panel engineering",
    "Client acquisition and freelancing",
    "Agency branding and pricing",
  ],
  numberOfCredits: 1,
  occupationalCredentialAwarded: "Professional Diploma in Web Development",
  timeRequired: "P4W",
  hasCourseInstance: {
    "@type": "CourseInstance",
    name: "October 2026 Cohort",
    startDate: "2026-10-19",
    endDate: "2026-11-15",
    courseMode: "Hybrid",
    courseWorkload: "PT8H",
    instructor: {
      "@type": "Person",
      name: "Doctor Barns",
      jobTitle: "Lead Instructor & CEO",
      worksFor: { "@id": `${APP_URL}/#organization` },
    },
    location: {
      "@type": "Place",
      name: "Doctor Barns Tech HQ",
      address: {
        "@type": "PostalAddress",
        streetAddress: "111 Newtown RD",
        addressLocality: "Accra Newtown",
        addressCountry: "GH",
      },
    },
    offers: {
      "@type": "Offer",
      price: FEE_STRING,
      priceCurrency: "GHS",
      availability: "https://schema.org/LimitedAvailability",
      url: `${APP_URL}/apply`,
      validFrom: "2026-01-01",
      validThrough: "2026-10-19",
      category: "Web Development Training",
    },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    ratingCount: "47",
    reviewCount: "32",
  },
  inLanguage: "en",
  isAccessibleForFree: false,
};

const faqSchema = {
  "@type": "FAQPage",
  "@id": `${APP_URL}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need any prior coding experience?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This masterclass is designed for absolute beginners. We take you from zero to building production-ready web applications in 4 weeks. All you need is a laptop, dedication, and the willingness to learn.",
      },
    },
    {
      "@type": "Question",
      name: "What exactly will I be able to build after the masterclass?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You will build corporate websites, e-commerce platforms with payment integration, management dashboards (school, hotel, hospital, POS systems), CRM tools, and full SaaS products. These are the exact systems that businesses pay thousands of Cedis for.",
      },
    },
    {
      "@type": "Question",
      name: "Is the first client really guaranteed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our first-client guarantee depends on student seriousness and strict adherence to instructions. We provide direct coaching and a dedicated client acquisition process to support students who execute fully.",
      },
    },
    {
      "@type": "Question",
      name: "What is the 100K in 2 Weeks Challenge?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It's our client generation challenge where students learn to find, pitch, and close high-paying corporate clients. The goal is to help you generate GHS 100,000 worth of contracts within 2 weeks of completing the program using our proven outreach systems.",
      },
    },
    {
      "@type": "Question",
      name: "How does the 1-month internship work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After the 4-week masterclass, every student transitions into a 1-month internship at Doctor Barns Tech. You'll work on real client projects alongside senior developers, building your portfolio and professional experience.",
      },
    },
    {
      "@type": "Question",
      name: "What does 'Top 2 Get Hired' mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The two highest-performing students in the cohort will receive a full-time job offer from Doctor Barns Tech. Performance is evaluated based on project quality, initiative, and client work during the program.",
      },
    },
    {
      "@type": "Question",
      name: "Can I pay in installments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a 20% deposit (GHS 200), a 50% payment (GHS 500), or pay the full GHS 1,000 upfront. All payment tiers secure your seat immediately.",
      },
    },
    {
      "@type": "Question",
      name: "What tech stack will I learn?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You'll master Next.js (React), TypeScript, Tailwind CSS, Supabase (PostgreSQL), authentication systems, payment gateways (Paystack, Moolre), and deployment. This is the same modern stack used by top startups worldwide.",
      },
    },
    {
      "@type": "Question",
      name: "Is the training online or offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The masterclass is hybrid: one onsite session in Accra and two online sessions each week. This format blends hands-on accountability with flexible follow-up sessions.",
      },
    },
    {
      "@type": "Question",
      name: "What do I get at the end of the program?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You receive a Professional Diploma in Web Development, a professional portfolio of real projects, your first paying client, a 1-month internship, access to our alumni network, and a chance to be hired full-time by Doctor Barns Tech.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: APP_URL },
    { "@type": "ListItem", position: 2, name: "Apply", item: `${APP_URL}/apply` },
  ],
};

const websiteSchema = {
  "@type": "WebSite",
  "@id": `${APP_URL}/#website`,
  url: APP_URL,
  name: "Remote Work Hub",
  description: "Elite Web Development & SaaS Masterclass by Doctor Barns Tech — Accra, Ghana",
  publisher: { "@id": `${APP_URL}/#organization` },
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${APP_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const eventSchema = {
  "@type": "EducationEvent",
  name: "2026 Elite Web Development & SaaS Masterclass",
  description:
    "4-week intensive hybrid web development training in Accra. Learn to build real business applications, complete a 1-month internship, and pursue your first client with guided support.",
startDate: "2026-10-19T09:00:00+00:00",
    endDate: "2026-11-15T17:00:00+00:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Doctor Barns Tech HQ",
    address: {
      "@type": "PostalAddress",
      streetAddress: "111 Newtown RD",
      addressLocality: "Accra Newtown",
      addressCountry: "GH",
    },
  },
  organizer: { "@id": `${APP_URL}/#organization` },
  performer: {
    "@type": "Person",
    name: "Doctor Barns",
  },
  offers: {
    "@type": "Offer",
    price: FEE_STRING,
    priceCurrency: "GHS",
    availability: "https://schema.org/LimitedAvailability",
    url: `${APP_URL}/apply`,
    validFrom: "2026-01-01",
  },
  image: `${APP_URL}/opengraph-image`,
  inLanguage: "en",
};

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema,
      organizationSchema,
      courseSchema,
      eventSchema,
      faqSchema,
      breadcrumbSchema,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
