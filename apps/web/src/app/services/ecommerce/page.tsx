import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer, { DEFAULT_CONTACT_ITEMS, DEFAULT_SOCIAL_ITEMS } from '@/sections/footer/Footer'
import ServicePage, { type ServicePageData } from '@/sections/service/ServicePage'

export const metadata: Metadata = {
  title: 'E-Commerce Development in Doha, Qatar',
  description:
    'Nous builds Shopify and headless e-commerce stores for businesses in Qatar — bilingual Arabic/English, integrated payments, and custom storefronts. Based in Doha.',
  alternates: { canonical: 'https://nous.qa/services/ecommerce' },
  openGraph: {
    title: 'E-Commerce Development in Doha, Qatar — Nous',
    description: 'Shopify and headless e-commerce for Qatar businesses. Bilingual, fast, conversion-optimized.',
    url: 'https://nous.qa/services/ecommerce',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'E-Commerce Development',
  provider: { '@type': 'Organization', name: 'Nous', url: 'https://nous.qa' },
  areaServed: ['QA', 'AE', 'SA'],
  description: 'Shopify and headless e-commerce development for businesses in Qatar and the Gulf, including bilingual Arabic/English storefronts and Gulf payment integrations.',
  url: 'https://nous.qa/services/ecommerce',
}

const service: ServicePageData = {
  name: 'E-Commerce Solutions',
  nameAr: 'حلول التجارة الإلكترونية',
  slug: 'ecommerce',
  tagline: 'Online stores built for Gulf shoppers.',
  description:
    'We design and develop e-commerce platforms built for the Qatar and Gulf market — bilingual from day one, integrated with local payment gateways, and optimized for the mobile-first shopping behavior of Gulf consumers. Whether you need a Shopify store, a headless storefront, or a fully custom platform, we deliver it complete.',
  whatWeDeliver: [
    'Shopify store design, development, and theme customization',
    'Headless Shopify with Next.js custom storefront',
    'WooCommerce and custom e-commerce builds',
    'Bilingual Arabic/English storefronts with RTL',
    'Gulf payment gateway integration (Tap, KNET, Mada, Stripe)',
    'Inventory management and ERP integration',
    'WhatsApp order notifications and customer support automation',
    'Conversion rate optimization and A/B testing setup',
  ],
  techStack: ['Shopify', 'Shopify Storefront API', 'Next.js', 'WooCommerce', 'Stripe', 'Tap Payments', 'Twilio', 'Klaviyo', 'PostgreSQL', 'Supabase'],
  useCases: [
    {
      title: 'Fashion and apparel',
      body: 'Premium bilingual storefronts with editorial design, size guides, and WhatsApp-based post-purchase support for Gulf fashion brands.',
    },
    {
      title: 'Food and specialty retail',
      body: 'Product catalogs with rich media, subscription options, and delivery zone management for Doha-based food brands.',
    },
    {
      title: 'B2B wholesale platforms',
      body: 'Private wholesale portals with tiered pricing, bulk ordering, and quote-request workflows for Qatar distributors.',
    },
  ],
  faq: [
    {
      q: 'Can you build a Shopify store in Arabic?',
      a: 'Yes. We build fully bilingual Shopify stores with native RTL Arabic layouts, Arabic product descriptions, and Arabic checkout flows.',
    },
    {
      q: 'Which payment gateways do you integrate with?',
      a: 'We integrate with Tap Payments, KNET, Mada, Apple Pay, Stripe, and PayPal. We recommend Tap Payments for most Qatar-based stores.',
    },
    {
      q: 'Do you offer ongoing store management after launch?',
      a: 'Yes. We offer retainer packages for ongoing design updates, feature additions, and technical maintenance.',
    },
  ],
}

export default function EcommerceServicePage() {
  return (
    <>
      <Cursor />
      <Noise />
      <Nav siteName="nous." />
      <main id="main-content">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ServicePage service={service} />
      </main>
      <Footer siteName="nous." companyName="Nous" contactItems={DEFAULT_CONTACT_ITEMS} socialItems={DEFAULT_SOCIAL_ITEMS} />
    </>
  )
}
