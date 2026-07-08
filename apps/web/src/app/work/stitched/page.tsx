import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer, { DEFAULT_CONTACT_ITEMS, DEFAULT_SOCIAL_ITEMS } from '@/sections/footer/Footer'
import CaseStudyPage from '@/sections/work/CaseStudyPage'

export const metadata: Metadata = {
  title: 'Stitched, Case Study',
  description:
    'How Nous designed and developed the Stitched e-commerce platform, a premium fashion brand built on Shopify with a custom headless storefront and integrated CRM.',
  alternates: { canonical: 'https://nous.qa/work/stitched' },
  openGraph: {
    title: 'Stitched, Case Study | Nous',
    description: 'Premium fashion e-commerce built by Nous. Shopify headless, custom storefront, CRM integration.',
    url: 'https://nous.qa/work/stitched',
    alternateLocale: ['ar_QA'],
    type: 'article',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stitched, Case Study | Nous',
    description: 'Premium fashion e-commerce built by Nous. Shopify headless, custom storefront, CRM integration.',
    images: ['/opengraph-image'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Stitched, E-Commerce Platform',
  url: 'https://nous.qa/work/stitched',
  creator: {
    '@type': 'Organization',
    name: 'Nous',
    url: 'https://nous.qa',
  },
  description:
    'A premium fashion e-commerce platform built on Shopify with a custom headless storefront, CRM integration, and a bilingual Arabic/English interface for the Qatar market.',
  keywords: ['Shopify', 'headless commerce', 'fashion e-commerce', 'Qatar', 'Doha', 'bilingual'],
  inLanguage: ['en', 'ar'],
}

const project = {
  name: 'Stitched',
  nameAr: 'ستيتشد',
  tagline: 'Premium fashion e-commerce for the Qatar market.',
  year: '2024',
  tags: ['E-Commerce', 'Shopify', 'Headless', 'Design'],
  externalUrl: 'https://stitchedqa.com',
  services: ['E-Commerce Solutions', 'Full-Stack Engineering', 'Design & Motion'],
  overview:
    'Stitched is a Doha-based premium fashion brand serving customers across Qatar. Nous was brought in to design and build their full e-commerce experience, from brand identity and storefront design through to the technical build on Shopify.',
  challenge:
    'The client needed a bilingual (Arabic/English) storefront that felt premium and editorial, integrated with their existing CRM and inventory systems, and optimized for mobile-first Gulf shoppers who primarily use WhatsApp for post-purchase support.',
  solution:
    'We built a custom headless Shopify storefront using Next.js, with a fully RTL-capable Arabic layout and automated WhatsApp order notifications via the Twilio API. The design system uses a restrained dark palette with editorial typography to reflect the brand\'s premium positioning.',
  results: [
    { metric: 'Storefront live', value: '6 weeks', note: 'from brief to launch' },
    { metric: 'Mobile sessions', value: '78%', note: 'of all traffic' },
    { metric: 'Bilingual', value: 'AR + EN', note: 'full RTL support' },
  ],
  tech: ['Next.js', 'Shopify', 'Headless Commerce', 'Twilio', 'PostgreSQL', 'Figma'],
  imageUrl: null,
}

export default function StitchedCase() {
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
