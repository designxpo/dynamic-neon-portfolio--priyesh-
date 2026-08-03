// Single source of truth for the home-page FAQ — used both for the FAQPage
// JSON-LD (app/page.tsx) and the visible <Faq> section (rendered in the app),
// so the structured data and the on-page Q&A never drift apart.
export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: 'What does Priyesh Mishra do?',
    answer:
      'Priyesh Mishra is a UI/UX designer and developer who designs and builds high-converting digital products — websites, web apps, and dashboards — and runs performance marketing for SaaS, D2C, fintech, and eCommerce brands.',
  },
  {
    question: 'What services does Priyesh Mishra offer?',
    answer:
      'UI/UX design (websites, mobile apps, dashboards), product design (wireframes, prototypes, design systems), full-stack website, app, and software development in Next.js, branding and visual identity, and performance marketing with server-side tracking.',
  },
  {
    question: 'What technologies does Priyesh Mishra build with?',
    answer:
      'Design in Figma and Adobe XD; development in Next.js, React, TypeScript, Node.js, and Supabase — shipping clean, scalable, performance-first products from design through deployment.',
  },
  {
    question: 'Where is Priyesh Mishra based?',
    answer:
      'Priyesh Mishra is based in New Delhi, India, and works with clients and teams worldwide, remotely.',
  },
  {
    question: 'How can I hire Priyesh Mishra?',
    answer:
      'Use the contact form on this site or reach out via the listed email and social profiles. Priyesh takes on UI/UX, product design, development, and performance-marketing projects for startups and established brands.',
  },
  {
    question: 'What industries has Priyesh Mishra worked in?',
    answer:
      'SaaS, fintech, eCommerce, and spiritual/creator brands — spanning product design, front-end development, and growth marketing.',
  },
];
