import type { Metadata, Viewport } from 'next'
import { Fraunces, Space_Mono } from 'next/font/google'
import './globals.css'

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F9F8F6',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () =>
              navigator.serviceWorker.register('/sw.js').catch(() => {})
            )
          }
        ` }} />
      </head>
      <body suppressHydrationWarning>
        <div className="page-wrap">{children}</div>
      </body>
    </html>
  )
}
