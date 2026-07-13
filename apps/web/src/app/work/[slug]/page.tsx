import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer from '@/sections/footer/Footer'
import CaseStudyPage from '@/sections/work/CaseStudyPage'
import { getSiteChrome } from '@/lib/site-chrome'
import { getCaseStudy, getCaseStudySlugs } from '@/lib/case-studies'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const p = await getCaseStudy(slug)
  if (!p) return { title: 'Case Study' }

  const title = `${p.name}, Case Study`
  const description = p.overview || p.tagline
  const url = `https://nous.qa/work/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Nous`,
      description,
      url,
      type: 'article',
      alternateLocale: ['ar_QA'],
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Nous`,
      description,
      images: ['/opengraph-image'],
    },
  }
}

export default async function WorkCaseStudy(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const [project, chrome] = await Promise.all([getCaseStudy(slug), getSiteChrome()])
  if (!project) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${project.name}, Case Study`,
    url: `https://nous.qa/work/${slug}`,
    creator: { '@type': 'Organization', name: 'Nous', url: 'https://nous.qa' },
    description: project.overview || project.tagline,
    keywords: project.tags,
    inLanguage: ['en', 'ar'],
  }

  return (
    <>
      <Cursor />
      <Noise />
      <Nav siteName={chrome.siteName} showLanguageSwitch />
      <main id="main-content">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CaseStudyPage project={project} />
      </main>
      <Footer
        siteName={chrome.siteName}
        companyName={chrome.companyName}
        contactItems={chrome.contactItems}
        socialItems={chrome.socialItems}
        footerCopyright={chrome.footerCopyright}
      />
    </>
  )
}
