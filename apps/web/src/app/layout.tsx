import type { Metadata, Viewport } from 'next'
import { Fraunces, Space_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'
import AnalyticsInit from '@/components/analytics/AnalyticsInit'
import WebVitals from '@/components/WebVitals'

// Fraunces is a variable font — drop `weight` when specifying custom axes
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  style: ['normal', 'italic'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

// Geometric modern Arabic — matches the mechanical precision of Space Mono
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-ibm-arabic',
  display: 'swap',
  weight: ['400', '700'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nous.qa'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: '/manifest.json',
  title: {
    default: 'Nous, AI, Web & App Development Agency in Doha, Qatar',
    template: '%s | Nous',
  },
  description:
    'Nous is a Doha, Qatar-based technology agency specializing in AI, full-stack engineering, mobile development, e-commerce, cloud infrastructure, and design. We transform complex visions into intelligent systems.',
  authors: [{ name: 'Nous', url: 'https://nous.qa' }],
  alternates: {
    canonical: 'https://nous.qa',
    languages: { 'en': 'https://nous.qa', 'ar-QA': 'https://nous.qa/ar' },
  },
  openGraph: {
    title: 'Nous, AI, Web & App Development Agency in Doha, Qatar',
    description: 'Quiet luxury. Engineered systems. Doha, Qatar.',
    url: 'https://nous.qa',
    siteName: 'Nous',
    locale: 'en_US',
    // TODO: once dedicated /ar routes ship, set this dynamically per-locale
    // instead of listing it sitewide (see hreflang links below for the
    // equivalent HTML-level signal already in place).
    alternateLocale: ['ar_QA'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nous, AI, Web & App Development Agency in Doha, Qatar',
    description: 'Quiet luxury. Engineered systems. Doha, Qatar.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

// Sitewide only — this describes the business itself, so it's valid on every
// page. Page-specific structured data (FAQPage, CreativeWork, etc.) belongs on
// the page that actually shows that content, not here (see page.tsx for the
// homepage FAQ schema).
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
    '@id': 'https://nous.qa/#organization',
    name: 'Nous',
    url: 'https://nous.qa',
    logo: {
      '@type': 'ImageObject',
      url: 'https://nous.qa/nous-logo.svg',
    },
    image: 'https://nous.qa/nous-logo.svg',
    description: 'Nous is a Doha, Qatar-based technology agency specializing in AI development, full-stack engineering, mobile development, e-commerce solutions, cloud infrastructure, and design.',
    telephone: '+97477484004',
    email: 'nouslab@icould.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Doha',
      addressRegion: 'Doha',
      addressCountry: 'QA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.2854,
      longitude: 51.5310,
    },
    areaServed: ['QA', 'AE', 'SA', 'KW', 'BH', 'OM'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+97477484004',
      email: 'nouslab@icould.com',
      areaServed: 'QA',
      availableLanguage: ['English', 'Arabic'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
        opens: '09:00',
        closes: '18:00',
      },
    },
    sameAs: [
      'https://www.linkedin.com/company/nous-qa',
      'https://www.instagram.com/nous.qa',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Technology Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Artificial Intelligence Development', description: 'LLMs, RAG, AI agents, NLP, TensorFlow, PyTorch: custom AI systems built for Qatar businesses.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Full-Stack Web Development', description: 'React, Next.js, Node.js, Go, Python, PostgreSQL: end-to-end web applications and APIs.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mobile App Development', description: 'React Native, Swift, Flutter, Kotlin: iOS and Android apps built for the Gulf market.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'E-Commerce Solutions', description: 'Shopify, headless commerce, Stripe, WooCommerce: online stores and retail platforms.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cloud Infrastructure', description: 'AWS, GCP, Docker, Kubernetes, Terraform, CI/CD: scalable cloud architecture and DevOps.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Design & Motion', description: 'Figma, Framer, GSAP, Three.js: premium UI/UX design and motion design.' } },
      ],
    },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F9F8F6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceMono.variable} ${ibmPlexArabic.variable}`}>
      <head>
        {/* hreflang — tells search engines which language version is canonical for each locale.
            TODO: the ar-QA target below (/ar) does not exist as a real route yet, the site is
            English-only with inline Arabic content. Once dedicated /ar pages ship, point this
            at real localized routes and add matching alternates.languages entries per page. */}
        <link rel="alternate" hrefLang="en" href="https://nous.qa" />
        <link rel="alternate" hrefLang="ar-QA" href="https://nous.qa/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://nous.qa" />
        {/* JSON-LD: Organization/LocalBusiness — valid sitewide, unlike the
            homepage-specific hero image preload and FAQ schema which used to
            live here (see page.tsx) and were leaking onto every route. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Service Worker registration */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () =>
              navigator.serviceWorker.register('/sw.js').catch(() => {})
            )
          }
        ` }} />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <AnalyticsInit />
        <WebVitals />
        <div className="page-wrap" suppressHydrationWarning>{children}</div>
      </body>
    </html>
  )
}
