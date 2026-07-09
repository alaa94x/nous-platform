import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer from '@/sections/footer/Footer'
import ServicePage, { type ServicePageData } from '@/sections/service/ServicePage'
import { getSiteChrome } from '@/lib/site-chrome'

export const metadata: Metadata = {
  title: 'Mobile App Development in Doha, Qatar',
  description:
    'Nous builds iOS and Android apps for businesses in Qatar, React Native, Swift, Flutter, and Kotlin. Mobile app development agency based in Doha.',
  alternates: { canonical: 'https://nous.qa/services/mobile' },
  openGraph: {
    title: 'Mobile App Development in Doha, Qatar | Nous',
    description: 'iOS and Android apps built for the Gulf market. React Native, Swift, Flutter, Kotlin.',
    url: 'https://nous.qa/services/mobile',
    alternateLocale: ['ar_QA'],
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobile App Development in Doha, Qatar | Nous',
    description: 'iOS and Android apps built for the Gulf market. React Native, Swift, Flutter, Kotlin.',
    images: ['/opengraph-image'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Mobile App Development',
  provider: { '@type': 'Organization', name: 'Nous', url: 'https://nous.qa' },
  areaServed: ['QA', 'AE', 'SA'],
  description: 'iOS and Android mobile app development for businesses in Qatar and the Gulf, using React Native, Swift, Flutter, and Kotlin.',
  url: 'https://nous.qa/services/mobile',
}

const service: ServicePageData = {
  name: 'Mobile Development',
  nameAr: 'تطوير تطبيقات الجوال',
  slug: 'mobile',
  tagline: 'iOS and Android apps built for the Gulf market.',
  description:
    'We design and build mobile applications for iOS and Android, with a focus on the Gulf market. Whether you need a cross-platform app in React Native or Flutter, or a native Swift or Kotlin build, we deliver polished, performant apps that work flawlessly on Arabic and English devices.',
  whatWeDeliver: [
    'Cross-platform apps with React Native or Flutter',
    'Native iOS development with Swift and SwiftUI',
    'Native Android development with Kotlin',
    'Progressive Web Apps (PWA) for mobile web',
    'App Store and Google Play submission and optimization',
    'Push notifications, offline support, and deep linking',
    'Arabic RTL layout and bilingual interface support',
    'Integration with payment gateways (Tap Payments, Stripe)',
  ],
  techStack: ['React Native', 'Flutter', 'Swift', 'SwiftUI', 'Kotlin', 'Expo', 'Firebase', 'Supabase', 'Redux Toolkit', 'Zustand', 'Tap Payments', 'Apple Pay'],
  useCases: [
    {
      title: 'Consumer apps',
      body: 'Retail, food delivery, services marketplaces, and lifestyle apps built for Gulf consumers who expect a premium mobile experience.',
    },
    {
      title: 'Enterprise mobile tools',
      body: 'Field service apps, internal tools, and operations management apps that replace paper processes in Arabic and English.',
    },
    {
      title: 'Companion apps for web platforms',
      body: 'A mobile app that extends your existing web platform, sharing the same API and data layer with no duplication.',
    },
  ],
  faq: [
    {
      q: 'Do you build for both iOS and Android?',
      a: 'Yes. We deliver for both platforms, either as a cross-platform React Native or Flutter app (one codebase, two platforms) or as separate native builds.',
    },
    {
      q: 'Do your apps support Arabic?',
      a: 'Yes. All our mobile apps support full Arabic RTL layouts, Arabic keyboards, and bilingual content switching.',
    },
    {
      q: 'Can you take over an existing app?',
      a: 'Yes. We can audit, maintain, and extend existing apps regardless of the framework, provided we have access to the source code.',
    },
  ],
}

export const revalidate = 60

export default async function MobileServicePage() {
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
