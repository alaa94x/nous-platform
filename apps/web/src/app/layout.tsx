import type { Metadata, Viewport } from 'next'
import { Fraunces, Space_Mono } from 'next/font/google'
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nous.qa'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: '/manifest.json',
  title: {
    default: 'Nous — AI, Web & App Development Agency in Doha, Qatar',
    template: '%s — Nous',
  },
  description:
    'Nous is a Doha, Qatar-based technology agency specializing in AI, full-stack engineering, mobile development, e-commerce, cloud infrastructure, and design. We transform complex visions into intelligent systems.',
  authors: [{ name: 'Nous', url: 'https://nous.qa' }],
  alternates: {
    canonical: 'https://nous.qa',
    languages: { 'en': 'https://nous.qa', 'ar-QA': 'https://nous.qa/ar' },
  },
  openGraph: {
    title: 'Nous — AI, Web & App Development Agency in Doha, Qatar',
    description: 'Quiet luxury. Engineered systems. Doha, Qatar.',
    url: 'https://nous.qa',
    siteName: 'Nous',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nous — AI, Web & App Development Agency in Doha, Qatar',
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

const jsonLd = [
  {
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
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Artificial Intelligence Development', description: 'LLMs, RAG, AI agents, NLP, TensorFlow, PyTorch — custom AI systems built for Qatar businesses.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Full-Stack Web Development', description: 'React, Next.js, Node.js, Go, Python, PostgreSQL — end-to-end web applications and APIs.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mobile App Development', description: 'React Native, Swift, Flutter, Kotlin — iOS and Android apps built for the Gulf market.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'E-Commerce Solutions', description: 'Shopify, headless commerce, Stripe, WooCommerce — online stores and retail platforms.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cloud Infrastructure', description: 'AWS, GCP, Docker, Kubernetes, Terraform, CI/CD — scalable cloud architecture and DevOps.' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Design & Motion', description: 'Figma, Framer, GSAP, Three.js — premium UI/UX design and motion design.' } },
      ],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does Nous do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nous is a technology agency based in Doha, Qatar. We design and build AI systems, web applications, mobile apps, e-commerce platforms, and cloud infrastructure for businesses in Qatar and across the Gulf region.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is Nous located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nous is based in Doha, Qatar. We work with clients across Qatar, the UAE, Saudi Arabia, and the broader GCC region.',
        },
      },
      {
        '@type': 'Question',
        name: 'What technologies does Nous build with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We work with React, Next.js, Node.js, Python, Go, React Native, Swift, Flutter, Shopify, AWS, GCP, Docker, Kubernetes, and leading AI frameworks including LLMs, RAG pipelines, TensorFlow, and PyTorch.',
        },
      },
      {
        '@type': 'Question',
        name: 'How quickly does Nous respond to inquiries?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We reply to all project inquiries within 24 hours. You can also reach us immediately via WhatsApp at +974 7748 4004.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Nous work in Arabic?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Nous serves clients in both English and Arabic, and we build bilingual products that support both LTR and RTL interfaces.',
        },
      },
    ],
  },
]

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F9F8F6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceMono.variable}`}>
      <head>
        {/* hreflang — tells search engines which language version is canonical for each locale */}
        <link rel="alternate" hrefLang="en" href="https://nous.qa" />
        <link rel="alternate" hrefLang="ar-QA" href="https://nous.qa/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://nous.qa" />
        {/* Hero image — preload AVIF for supporting browsers, WebP as universal fallback.
            imagesrcset on the WebP link lets the browser pick the right breakpoint file
            before JS executes, eliminating the LCP discovery delay. */}
        <link
          rel="preload"
          as="image"
          href="/hero-1920.avif"
          type="image/avif"
        />
        <link
          rel="preload"
          as="image"
          href="/hero-1920.webp"
          type="image/webp"
          // @ts-expect-error — imagesrcset is valid HTML but not in React's type defs yet
          imagesrcset="/hero-828.webp 828w, /hero-1200.webp 1200w, /hero-1920.webp 1920w"
          imagesizes="100vw"
        />
        {/* Amiri Arabic font — preload the subset for LCP */}
        <link
          rel="preload"
          href="/fonts/amiri-400-arabic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/amiri-700-arabic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* JSON-LD structured data — array of graph nodes */}
        {jsonLd.map((node, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
          />
        ))}
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
