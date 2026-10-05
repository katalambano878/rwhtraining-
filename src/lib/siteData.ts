// ─── Remote Work Hub — Site Data ───────────────────────────────────────────

export const brand = {
  name: "Remote Work Hub",
  company: "Doctor Barns Tech",
  tagline: "Engineer Your Future. Build Real Systems. Land Real Clients.",
  shortTagline: "From Zero to Professional Developer in 4 Weeks.",
  phone: "+233 20 963 6158",
  whatsapp: "+233209636158",
  email: "info@remoteworkhub.org",
  website: "https://remoteworkhub.org",
  address: "111 Newtown RD, Accra Newtown, Ghana",
  social: {
    instagram: "https://instagram.com/remoteworkhub",
    facebook: "https://facebook.com/remoteworkhub",
    twitter: "https://twitter.com/remoteworkhub",
    linkedin: "https://linkedin.com/company/remoteworkhub",
  },
  cohort: {
    startDate: "October 19, 2026",
    duration: "4 Weeks",
    fee: "GHS 1,000",
    seats: 10,
    location: "Accra, Ghana",
    mode: "Hybrid (1 Onsite + 2 Online Weekly)",
  },
};

export const navLinks = [
  { label: "About", href: "/about" },
  { label: "Curriculum", href: "/curriculum" },
  { label: "Success Stories", href: "/success" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const curriculum = [
  {
    week: 1,
    title: "Foundations, Frontend & UI Systems",
    subtitle: "From Zero to Building Professional Interfaces",
    color: "blue" as const,
    topics: [
      "HTML5 semantic structure & accessibility principles",
      "CSS3 mastery — layouts, flexbox, grid & responsive design",
      "Git version control & GitHub collaboration workflow",
      "VS Code environment setup & productivity tools",
      "Next.js project structure & React fundamentals",
      "Tailwind CSS utility-first design system mastery",
      "Component architecture, reusability & TypeScript",
      "React hooks — useState, useEffect, useContext",
      "Animations & micro-interactions with Framer Motion",
      "UI libraries (Shadcn/ui) & design system integration",
    ],
    project: "Fully responsive corporate website with animations, dynamic content & mobile-first design",
    outcome: "You'll build frontend UIs indistinguishable from senior developer work — live on Vercel by end of Week 1.",
  },
  {
    week: 2,
    title: "Backend, Databases & Authentication",
    subtitle: "Full-Stack Engineering Power",
    color: "indigo" as const,
    topics: [
      "Supabase PostgreSQL database design & schema architecture",
      "Next.js API routes & server-side logic",
      "Authentication — JWT, session management, OAuth (Google)",
      "Role-Based Access Control (RBAC) for multi-role systems",
      "File uploads, image storage & Supabase Storage buckets",
      "Data validation, error handling & security best practices",
      "E-commerce architecture — product catalogs & variants",
      "Shopping cart logic, checkout flows & order management",
      "Paystack & Moolre payment gateway integration",
      "Email notifications with Resend & transactional templates",
    ],
    project: "Full-stack e-commerce platform with authentication, payment processing & admin dashboard",
    outcome: "You'll build secure, production-grade backends with real user authentication and live payments.",
  },
  {
    week: 3,
    title: "Enterprise Systems & Complex Dashboards",
    subtitle: "Corporate-Grade Software Architecture",
    color: "blue" as const,
    topics: [
      "Complex dashboard architecture with data visualization (Recharts)",
      "Point-of-Sale (POS) system with real-time inventory",
      "School management — student portals, teacher dashboards & admin controls",
      "CRM systems — lead pipelines & client relationship management",
      "Hotel/hostel booking systems with room allocation logic",
      "Hospital management — appointments, patient records & billing",
      "Real-time data subscriptions with Supabase Realtime",
      "Deployment, custom domains, SSL & production hosting",
      "VPS setup, CyberPanel & Coolify for client projects",
    ],
    project: "Enterprise management system (school, hospital or hotel) with full CRUD, roles & reporting",
    outcome: "You'll build the exact enterprise tools businesses pay GHS 10,000+ to acquire.",
  },
  {
    week: 4,
    title: "Client Acquisition, Branding & Launch",
    subtitle: "From Developer to Agency Owner",
    color: "amber" as const,
    topics: [
      "Freelance agency positioning, pricing strategy & packaging",
      "Client psychology — how to find, pitch & close corporate deals",
      "Proposal writing, contract templates & project scoping",
      "The 100K in 2 Weeks Challenge — live client acquisition",
      "Personal branding, portfolio presentation & LinkedIn optimization",
      "SaaS fundamentals — subscription models & multi-tenant architecture",
      "Final portfolio assembly & professional project showcase",
    ],
    project: "Your own professional agency website + first signed client contract",
    outcome: "You leave with a paying client. Not a maybe — a guarantee.",
  },
];

export const portfolioSystems = [
  {
    name: "School Management",
    desc: "Student, teacher & admin portals with full CRUD and reporting.",
    icon: "GraduationCap",
    value: "GHS 8,000+",
  },
  {
    name: "POS Systems",
    desc: "Real-time sales tracking, inventory management & automated receipts.",
    icon: "Monitor",
    value: "GHS 6,500+",
  },
  {
    name: "Hotel Management",
    desc: "Room booking, guest check-in/out, housekeeping & billing systems.",
    icon: "Building2",
    value: "GHS 9,000+",
  },
  {
    name: "Hospital Management",
    desc: "Patient records, doctor appointments, prescriptions & lab results.",
    icon: "Activity",
    value: "GHS 12,000+",
  },
  {
    name: "CRM Systems",
    desc: "Lead pipelines, client follow-ups, deal tracking & team assignments.",
    icon: "Users",
    value: "GHS 7,000+",
  },
  {
    name: "Hostel Management",
    desc: "Bed-space allocation, rent billing, maintenance requests & occupancy tracking.",
    icon: "Home",
    value: "GHS 5,500+",
  },
  {
    name: "Accounting Software",
    desc: "Dynamic invoicing, expense tracking, financial reports & tax summaries.",
    icon: "LineChart",
    value: "GHS 8,500+",
  },
  {
    name: "ERP Platforms",
    desc: "Full enterprise resource planning — HR, inventory, finance & procurement.",
    icon: "Cpu",
    value: "GHS 15,000+",
  },
  {
    name: "E-Commerce Stores",
    desc: "Product catalogs, cart, checkout & Paystack/Moolre payment processing.",
    icon: "ShoppingCart",
    value: "GHS 6,000+",
  },
  {
    name: "SaaS Dashboards",
    desc: "Subscription management, analytics, multi-tenant architecture & billing.",
    icon: "LayoutDashboard",
    value: "GHS 10,000+",
  },
  {
    name: "Church & NGO Portals",
    desc: "Member management, event scheduling, donation tracking & giving reports.",
    icon: "Heart",
    value: "GHS 4,500+",
  },
  {
    name: "Corporate Websites",
    desc: "Premium, SEO-optimized sites with CMS integration that close high-ticket clients.",
    icon: "Globe",
    value: "GHS 3,500+",
  },
];

export const guarantees = [
  {
    title: "First Client Pathway",
    desc: "Our first-client guarantee depends on student seriousness and strict adherence to instructions. We coach each student closely to execute the process and close real opportunities.",
    icon: "Target",
    color: "emerald" as const,
    stat: "100%",
    statLabel: "Client Success Rate",
  },
  {
    title: "Top 2 Get Hired Full-Time",
    desc: "The two highest-performing students receive a full-time job offer from Doctor Barns Tech. Performance is measured across project quality, initiative, client work & technical depth.",
    icon: "Flame",
    color: "amber" as const,
    stat: "2",
    statLabel: "Job Offers Per Cohort",
  },
  {
    title: "Professional Diploma",
    desc: "Graduate with a professional Diploma in Web Development issued by Doctor Barns Tech. A credential that signals real-world capability — not just course completion.",
    icon: "Award",
    color: "blue" as const,
    stat: "✓",
    statLabel: "Industry Recognized",
  },
  {
    title: "1-Month Internship",
    desc: "After 4 weeks of training, every student transitions into a 1-month internship at Doctor Barns Tech — working on live client projects alongside senior developers.",
    icon: "Briefcase",
    color: "blue" as const,
    stat: "1 Month",
    statLabel: "Paid Real-World Experience",
  },
];

export const testimonials = [
  {
    id: "kweku",
    name: "Kweku Asante",
    role: "Web Developer & Freelancer",
    cohort: "Cohort 1 Graduate",
    quote:
      "I walked in knowing nothing about code. By Week 5, I had signed a GHS 6,000 contract for a school management system. The 100K Challenge was real — it didn't just teach me to build, it taught me to sell. That combination is everything.",
    highlight: "Signed GHS 6,000 contract before graduation",
    avatar: "KA",
    rating: 5,
  },
  {
    id: "efua",
    name: "Efua Mensah",
    role: "Full-Stack Developer at Doctor Barns Tech",
    cohort: "Cohort 1 — Top 2 Graduate",
    quote:
      "I was in the top 2. Got hired. Now I build enterprise systems for real clients every single day. This wasn't a tutorial course — this was a complete, irreversible career transformation. Dr. Barns builds professionals, not hobbyists.",
    highlight: "Top 2 Graduate → Full-Time Hired",
    avatar: "EM",
    rating: 5,
  },
  {
    id: "kofi",
    name: "Kofi Boateng",
    role: "Freelance Developer & Agency Owner",
    cohort: "Cohort 2 Graduate",
    quote:
      "The internship experience alone was worth more than the entire program fee. Working on live client projects with senior devs — I learned more in that month than I ever could watching YouTube videos for a year.",
    highlight: "Launched own dev agency 2 months after graduation",
    avatar: "KB",
    rating: 5,
  },
  {
    id: "adwoa",
    name: "Adwoa Amponsah",
    role: "E-Commerce Specialist",
    cohort: "Cohort 2 Graduate",
    quote:
      "Dr. Barns doesn't teach copy-paste. He makes you understand the actual architecture — why things work the way they do. Now I can build any system a client throws at me and price it confidently. My rate has tripled.",
    highlight: "Built 4 e-commerce platforms in 3 months post-program",
    avatar: "AA",
    rating: 5,
  },
  {
    id: "nana",
    name: "Nana Osei",
    role: "Technical Consultant",
    cohort: "Cohort 1 Graduate",
    quote:
      "Before RWH, I was spending 8 hours a day watching tutorials and going nowhere. The offline immersion format cuts through all the noise. You sit, you build, you get corrected in real-time by someone who actually knows what they're doing.",
    highlight: "From tutorial hell to GHS 4,000/month income",
    avatar: "NO",
    rating: 5,
  },
];

export const faqs = [
  {
    q: "Do I need any prior coding experience?",
    a: "No. This masterclass is designed from the ground up for absolute beginners. We take you from zero to building production-ready web applications across 4 intensive weeks. All you need is a laptop, dedication, and the willingness to be challenged.",
  },
  {
    q: "What exactly will I be able to build after the masterclass?",
    a: "You will build corporate websites, full e-commerce platforms with payment integration, management dashboards (school, hotel, hospital, POS systems), CRM tools, accounting software, and complete SaaS products. These are the exact systems that Ghanaian businesses pay GHS 5,000 – GHS 15,000 to acquire.",
  },
  {
    q: "Is the first client really guaranteed?",
    a: "Yes. We have a dedicated Client Acquisition module in Week 4 where you learn lead generation, pitching, proposal writing, and closing. We work individually with every student to ensure you sign your first paying web design contract before the program ends. No exceptions.",
  },
  {
    q: "How does the 1-month internship work?",
    a: "After the 4-week masterclass, every graduate transitions directly into a 1-month internship at Doctor Barns Tech. You'll work on live client projects alongside senior developers, building your portfolio and professional experience.",
  },
  {
    q: "What does 'Top 2 Get Hired' mean exactly?",
    a: "The two highest-performing students in each cohort receive a full-time job offer from Doctor Barns Tech. We evaluate on multiple dimensions: project quality, code architecture, initiative, client-facing communication, and performance during the internship period.",
  },
  {
    q: "Can I pay in installments?",
    a: "Yes. You can secure your seat with a 20% deposit (GHS 200) and pay the balance before the cohort starts. We also accept 50% upfront. WhatsApp us directly on +233209636158 to work out a plan that fits your situation.",
  },
  {
    q: "What tech stack will I learn?",
    a: "You'll master Next.js 15 (React 19), TypeScript, Tailwind CSS, Supabase (PostgreSQL), robust authentication systems, Paystack & Moolre payment gateways, Resend email APIs, and Vercel deployment. This is the same cutting-edge stack used by top global startups.",
  },
  {
    q: "Is the training online or offline?",
    a: "The masterclass is hybrid: 1 onsite meeting in Accra plus 2 online meetings each week. This structure combines live accountability, practical coaching, and flexible follow-through.",
  },
  {
    q: "What is the 100K in 2 Weeks Challenge?",
    a: "It's our client generation challenge in Week 4 where you learn to find, pitch, and close high-paying corporate clients. The target is GHS 100,000 worth of web development contracts within 2 weeks of graduating. Students who execute fully consistently exceed this.",
  },
  {
    q: "How many students are in each cohort?",
    a: "We deliberately cap every cohort at exactly 10 students. This is not a mass course — it's a focused, high-intensity development environment where every student gets direct, personalized mentorship from Dr. Barns. Quality over quantity, always.",
  },
  {
    q: "What do I receive at the end of the program?",
    a: "You receive: (1) A Professional Diploma in Web Development from Doctor Barns Tech, (2) A professional portfolio of real production projects, (3) Your first signed paying client contract, (4) A 1-month internship placement, (5) Lifetime access to the RWH Alumni Network, and (6) A chance at full-time employment.",
  },
  {
    q: "What is the total program fee?",
    a: "The full fee is GHS 1,000 for the complete 4-week program. This is a special promotional price for the October 2026 cohort. It covers all training, materials, your Professional Diploma, the 1-month internship placement, and the 100K Challenge client acquisition module. Every cedi is an investment in a skill set that pays you back for life.",
  },
];

export const stats = [
  { value: "100%", label: "First Client Rate", desc: "Every graduate lands a paying client" },
  { value: "10", label: "Students Per Cohort", desc: "Elite-level, personalized mentorship" },
  { value: "4 Wks", label: "Program Duration", desc: "From zero to professional developer" },
  { value: "2", label: "Students Get Hired", desc: "Full-time job at Doctor Barns Tech" },
];

export const instructorProfile = {
  name: "Dr. Barns",
  title: "Founder, Doctor Barns Tech & Remote Work Hub",
  bio: "Dr. Barns is a software engineer, architect, and entrepreneur with over a decade of experience building enterprise-grade web systems for clients across Ghana and internationally. He founded Doctor Barns Tech to fill a critical gap in Ghana's tech landscape — world-class, practical engineering training that connects directly to real employment and income.",
  credentials: [
    "10+ years professional software engineering experience",
    "Founder of Doctor Barns Tech — a full-service web development agency",
    "Architect of systems serving schools, hospitals, hotels & corporations across Ghana",
    "Trained and hired multiple developers now working at top tech companies",
    "Expert in Next.js, TypeScript, Supabase, and modern SaaS architecture",
  ],
  philosophy:
    "I don't train people to watch more tutorials. I build engineers. Every student who leaves Remote Work Hub is capable of walking into any boardroom, quoting six figures, and delivering. That's the standard.",
};
