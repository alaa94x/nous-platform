import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import DocumentLocale from '@/components/language/DocumentLocale'
import Footer from '@/sections/footer/Footer'
import CaseStudyPage from '@/sections/work/CaseStudyPage'
import { getSiteChrome } from '@/lib/site-chrome'
import { getCaseStudy, getCaseStudySlugs } from '@/lib/case-studies'

export const revalidate = 60

export async function generateStaticParams() {
  return (await getCaseStudySlugs()).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = await getCaseStudy(slug)
  if (!project) return { title: 'دراسة حالة' }
  const title = `${project.nameAr || project.name} — دراسة حالة`
  const description = project.overviewAr || project.taglineAr
  return {
    title,
    description,
    alternates: {
      canonical: `/ar/work/${slug}`,
      languages: { en: `/work/${slug}`, ar: `/ar/work/${slug}`, 'x-default': `/work/${slug}` },
    },
    openGraph: { title: `${title} | نوس`, description, url: `/ar/work/${slug}`, locale: 'ar_QA', alternateLocale: ['en_QA'], type: 'article', images: ['/opengraph-image'] },
  }
}

export default async function ArabicWorkCaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [project, chrome] = await Promise.all([getCaseStudy(slug), getSiteChrome()])
  if (!project) notFound()

  return (
    <>
      <DocumentLocale locale="ar" />
      <Cursor />
      <Noise />
      <Nav siteName={chrome.siteName} locale="ar" showLanguageSwitch />
      <main id="main-content"><CaseStudyPage project={project} locale="ar" /></main>
      <Footer siteName={chrome.siteName} companyName={chrome.companyName} contactItems={chrome.contactItems} socialItems={chrome.socialItems} footerCopyright={chrome.footerCopyright} locale="ar" />
    </>
  )
}
