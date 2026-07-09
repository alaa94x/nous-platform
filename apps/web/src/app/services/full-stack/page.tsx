import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer from '@/sections/footer/Footer'
import ServicePage, { type ServicePageData } from '@/sections/service/ServicePage'
import { getSiteChrome } from '@/lib/site-chrome'

export const metadata: Metadata = {
  title: 'Full-Stack Web Development in Doha, Qatar',
  description:
    'Nous builds web applications and APIs for businesses in Qatar, React, Next.js, Node.js, Go, Python, and PostgreSQL. Senior full-stack engineering based in Doha.',
  alternates: { canonical: 'https://nous.qa/services/full-stack' },
  openGraph: {
    title: 'Full-Stack Web Development Company in Doha, Qatar | Nous',
    description: 'React, Next.js, Node.js, and API development for Qatar businesses.',
    url: 'https://nous.qa/services/full-stack',
    alternateLocale: ['ar_QA'],
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Full-Stack Web Development Company in Doha, Qatar | Nous',
    description: 'React, Next.js, Node.js, and API development for Qatar businesses.',
    images: ['/opengraph-image'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Full-Stack Web Development',
  provider: { '@type': 'Organization', name: 'Nous', url: 'https://nous.qa' },
  areaServed: ['QA', 'AE', 'SA'],
  description: 'Full-stack web development services including React, Next.js, Node.js, Go, Python, and PostgreSQL for businesses in Qatar and the Gulf.',
  url: 'https://nous.qa/services/full-stack',
}

const service: ServicePageData = {
  name: 'Full-Stack Engineering',
  nameAr: 'تطوير الويب المتكامل',
  slug: 'full-stack',
  tagline: 'Web applications and APIs built for scale, in Doha.',
  description:
    'We build production-grade web applications from frontend to backend: React and Next.js on the frontend, Node.js, Go, or Python on the backend, PostgreSQL or Supabase as the data layer. We are a senior team that writes clean, maintainable code with no dependency on offshore sub-contractors.',
  whatWeDeliver: [
    'React and Next.js web applications (App Router, RSC)',
    'REST and GraphQL API design and development',
    'Real-time features (WebSockets, Server-Sent Events)',
    'Authentication, authorization, and role-based access',
    'Admin dashboards and content management systems',
    'Database design, migrations, and query optimization',
    'Third-party API integrations (payments, CRM, ERP)',
    'Performance auditing and Core Web Vitals optimization',
  ],
  techStack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Go', 'Python', 'PostgreSQL', 'Supabase', 'Redis', 'Prisma', 'tRPC', 'Tailwind CSS'],
  useCases: [
    {
      title: 'SaaS platforms',
      body: 'Multi-tenant web applications with billing, onboarding, and analytics built in from day one.',
    },
    {
      title: 'Internal tools and dashboards',
      body: 'Replace spreadsheets and manual processes with a custom tool that fits how your team actually works.',
    },
    {
      title: 'API-first products',
      body: 'A well-designed API that powers your web app, mobile app, and partner integrations from a single source of truth.',
    },
  ],
  faq: [
    {
      q: 'Do you work with existing codebases?',
      a: 'Yes. We take on legacy code, rewrites, and greenfield projects. We will audit your existing codebase before scoping any engagement.',
    },
    {
      q: 'Do you support Arabic and RTL layouts?',
      a: 'Yes. Every web application we build is bilingual-ready with native RTL support for Arabic.',
    },
    {
      q: 'Can you maintain the application after launch?',
      a: 'Yes. We offer ongoing retainer agreements for continued development, maintenance, and performance monitoring.',
    },
  ],
}

export const revalidate = 60

export default async function FullStackServicePage() {
  const chrome = await getSiteChrome()
  return (
    <>
      <Cursor />
      <Noise />
      <Nav siteName={chrome.siteName} />
      <main id="main-content">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ServicePage service={service} />
      </main>
      <Footer siteName={chrome.siteName} companyName={chrome.companyName} contactItems={chrome.contactItems} socialItems={chrome.socialItems} footerCopyright={chrome.footerCopyright} />
    </>
  )
}
