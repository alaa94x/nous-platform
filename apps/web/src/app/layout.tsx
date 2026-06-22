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
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
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
    email: 'nouslab@icould.com',
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
