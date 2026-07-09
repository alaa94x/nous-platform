import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer from '@/sections/footer/Footer'
import ServicePage, { type ServicePageData } from '@/sections/service/ServicePage'
import { getSiteChrome } from '@/lib/site-chrome'

export const metadata: Metadata = {
  title: 'UI/UX Design and Motion Design in Doha, Qatar',
  description:
    'Nous designs premium digital interfaces and motion experiences for businesses in Qatar, Figma, Framer, GSAP, Three.js, and bilingual Arabic/English design systems. Based in Doha.',
  alternates: { canonical: 'https://nous.qa/services/design' },
  openGraph: {
    title: 'UI/UX and Motion Design Agency in Doha, Qatar | Nous',
    description: 'Premium interface design and motion for Qatar businesses. Figma, Framer, GSAP, Three.js.',
    url: 'https://nous.qa/services/design',
    alternateLocale: ['ar_QA'],
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UI/UX and Motion Design Agency in Doha, Qatar | Nous',
    description: 'Premium interface design and motion for Qatar businesses. Figma, Framer, GSAP, Three.js.',
    images: ['/opengraph-image'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Design and Motion',
  provider: { '@type': 'Organization', name: 'Nous', url: 'https://nous.qa' },
  areaServed: ['QA', 'AE', 'SA'],
  description: 'UI/UX design, motion design, and design systems for businesses in Qatar and the Gulf, using Figma, Framer, GSAP, and Three.js.',
  url: 'https://nous.qa/services/design',
}

const service: ServicePageData = {
  name: 'Design & Motion',
  nameAr: 'التصميم والحركة',
  slug: 'design',
  tagline: 'Premium interfaces and motion for brands that care about craft.',
  description:
    'We design digital products and brand experiences that look and feel like they cost significantly more than they did. Our process is research-first: we audit your audience, your competition, and your brand assets before touching Figma. Every design we deliver is production-ready, not a concept that needs to be re-engineered before it can ship.',
  whatWeDeliver: [
    'UI/UX design for web and mobile (Figma)',
    'Design systems and component libraries',
    'Interactive prototypes and user testing',
    'Bilingual Arabic/English design with RTL systems',
    'Motion design and scroll-driven animations (GSAP)',
    '3D web experiences and environments (Three.js)',
    'Brand identity and visual language',
    'Framer-based interactive marketing sites',
  ],
  techStack: ['Figma', 'Framer', 'GSAP', 'Three.js', 'Motion (Framer Motion)', 'Spline', 'After Effects', 'Lottie', 'CSS Animation', 'WebGL'],
  useCases: [
    {
      title: 'Brand launch sites',
      body: 'A hero-quality launch site that makes investors, clients, and partners take the brand seriously from the first scroll.',
    },
    {
      title: 'SaaS product design',
      body: 'End-to-end product design for a web application, from information architecture and user flows through to a production-ready component library.',
    },
    {
      title: 'Motion and 3D brand experiences',
      body: 'GSAP scroll narratives, Three.js 3D environments, and Framer micro-interactions that make a digital product feel like a physical one.',
    },
  ],
  faq: [
    {
      q: 'Do you design for Arabic and English?',
      a: 'Yes. All our design work includes bilingual layouts with native Arabic RTL treatment. We do not retrofit LTR designs; we design both directions simultaneously.',
    },
    {
      q: 'Do you hand off design files or build the code too?',
      a: 'Both. We can deliver Figma files and design systems for your engineering team, or we can design and build the full product ourselves.',
    },
    {
      q: 'Can you redesign an existing product?',
      a: 'Yes. We start every redesign with an audit of the existing product: what works, what is broken, what the users actually need. We redesign with evidence, not aesthetics alone.',
    },
  ],
}

export const revalidate = 60

export default async function DesignServicePage() {
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
