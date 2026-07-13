import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import DocumentLocale from '@/components/language/DocumentLocale'
import Footer from '@/sections/footer/Footer'
import ServicePage from '@/sections/service/ServicePage'
import { ARABIC_SERVICES } from '@/lib/service-content-ar'
import { getSiteChrome } from '@/lib/site-chrome'

export const revalidate = 60

export function generateStaticParams() {
  return Object.keys(ARABIC_SERVICES).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = ARABIC_SERVICES[slug]
  if (!service) return { title: 'الخدمة' }
  return {
    title: `${service.name} في قطر`, description: service.description,
    alternates: { canonical: `/ar/services/${slug}`, languages: { en: `/services/${slug}`, ar: `/ar/services/${slug}`, 'x-default': `/services/${slug}` } },
    openGraph: { title: `${service.name} | نوس`, description: service.description, url: `/ar/services/${slug}`, locale: 'ar_QA', alternateLocale: ['en_QA'], images: ['/opengraph-image'] },
  }
}

export default async function ArabicServiceRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = ARABIC_SERVICES[slug]
  if (!service) notFound()
  const chrome = await getSiteChrome()

  return (
    <>
      <DocumentLocale locale="ar" />
      <Cursor /><Noise />
      <Nav siteName={chrome.siteName} locale="ar" showLanguageSwitch />
      <main id="main-content"><ServicePage service={service} locale="ar" /></main>
      <Footer siteName={chrome.siteName} companyName={chrome.companyName} contactItems={chrome.contactItems} socialItems={chrome.socialItems} footerCopyright={chrome.footerCopyright} locale="ar" />
    </>
  )
}
