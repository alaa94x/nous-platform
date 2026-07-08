import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer, { DEFAULT_CONTACT_ITEMS, DEFAULT_SOCIAL_ITEMS } from '@/sections/footer/Footer'
import CaseStudyPage from '@/sections/work/CaseStudyPage'

export const metadata: Metadata = {
  title: 'Elite Collections, Case Study',
  description:
    'How Nous built the Elite Collections digital platform, a luxury retail brand with a custom web presence, product catalog, and booking system in Doha, Qatar.',
  alternates: { canonical: 'https://nous.qa/work/elite-collections' },
  openGraph: {
    title: 'Elite Collections, Case Study | Nous',
    description: 'Luxury retail platform designed and developed by Nous in Doha, Qatar.',
    url: 'https://nous.qa/work/elite-collections',
    alternateLocale: ['ar_QA'],
    type: 'article',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elite Collections, Case Study | Nous',
    description: 'Luxury retail platform designed and developed by Nous in Doha, Qatar.',
    images: ['/opengraph-image'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Elite Collections, Digital Platform',
  url: 'https://nous.qa/work/elite-collections',
  creator: {
    '@type': 'Organization',
    name: 'Nous',
    url: 'https://nous.qa',
  },
  description:
    'A luxury retail digital platform for Elite Collections, featuring a curated product catalog, appointment booking system, and bilingual Arabic/English interface designed for the Doha market.',
  keywords: ['luxury retail', 'Qatar', 'Doha', 'e-commerce', 'booking system', 'bilingual'],
  inLanguage: ['en', 'ar'],
}

const project = {
  name: 'Elite Collections',
  nameAr: 'إيليت كوليكشنز',
  tagline: 'Luxury retail, digitized for Doha.',
  year: '2024',
  tags: ['Web', 'Design', 'E-Commerce', 'Full-Stack'],
  externalUrl: null,
  services: ['Full-Stack Engineering', 'Design & Motion', 'E-Commerce Solutions'],
  overview:
    'Elite Collections is a luxury retail brand based in Doha, Qatar. Nous designed and built their complete digital presence, encompassing brand identity, a curated product catalog, and an appointment booking system for private shopping experiences.',
  challenge:
    'Luxury retail in the Gulf market demands a digital presence that matches the in-store experience: unhurried, exclusive, and visually immaculate. The brand needed a bilingual platform that communicated prestige without being cold, and that funneled high-intent buyers toward private appointments rather than impulsive checkouts.',
  solution:
    'We built a custom Next.js platform with a restrained editorial design system, a Supabase-powered product catalog manageable from a custom admin, and a Calendly-integrated private appointment booking flow. The Arabic version was built RTL-native, not retrofitted.',
  results: [
    { metric: 'Launch timeline', value: '8 weeks', note: 'design to production' },
    { metric: 'Languages', value: '2', note: 'Arabic + English, both native' },
    { metric: 'Admin panel', value: 'Custom', note: 'no third-party CMS dependency' },
  ],
  tech: ['Next.js', 'Supabase', 'Tailwind CSS', 'Calendly API', 'Figma', 'Framer'],
  imageUrl: null,
}

export default function EliteCollectionsCase() {
  return (
    <>
      <Cursor />
      <Noise />
      <Nav siteName="nous." />
      <main id="main-content">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CaseStudyPage project={project} />
      </main>
      <Footer
        siteName="nous."
        companyName="Nous"
        contactItems={DEFAULT_CONTACT_ITEMS}
        socialItems={DEFAULT_SOCIAL_ITEMS}
      />
    </>
  )
}
