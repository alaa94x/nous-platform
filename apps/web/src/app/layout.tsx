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

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: 'Nous — Engineered Intelligence',
  description:
    'Transforming complex visions into intelligent systems and quiet luxury interfaces. We design and develop websites and apps that deliver true value.',
  keywords: ['AI', 'Full-Stack', 'Mobile', 'E-Commerce', 'Cloud', 'Doha', 'Qatar', 'Tech Agency'],
  authors: [{ name: 'Nous', url: 'https://nous.qa' }],
  alternates: { canonical: 'https://nous.qa' },
  openGraph: {
    title: 'Nous — Engineered Intelligence',
    description: 'Quiet luxury. Engineered systems. Doha, Qatar.',
    url: 'https://nous.qa',
    siteName: 'Nous',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nous — Engineered Intelligence',
    description: 'Quiet luxury. Engineered systems. Doha, Qatar.',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Nous',
  url: 'https://nous.qa',
  logo: 'https://nous.qa/nous-logo.svg',
  description: 'Qatar-based tech agency specializing in AI, full-stack engineering, mobile development, and intelligent systems.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'hello@nous.qa',
    areaServed: 'QA',
    availableLanguage: ['English', 'Arabic'],
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Doha',
    addressCountry: 'QA',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F9F8F6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceMono.variable}`}>
      <head>
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
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
