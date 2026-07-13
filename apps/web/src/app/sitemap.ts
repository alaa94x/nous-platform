import type { MetadataRoute } from 'next'
import { getCaseStudySlugs } from '@/lib/case-studies'

const BASE = 'https://nous.qa'

const SERVICE_SLUGS = ['ai', 'full-stack', 'mobile', 'ecommerce', 'cloud', 'design']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const caseStudySlugs = await getCaseStudySlugs()

  return [
    { url: BASE,              lastModified: now, changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/ar`,      lastModified: now, changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/ar/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // Case studies — sourced from the projects table (falls back to the seed
    // slugs) so publishing new work in admin adds it to the sitemap.
    ...caseStudySlugs.map(slug => ({
      url: `${BASE}/work/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...caseStudySlugs.map(slug => ({
      url: `${BASE}/ar/work/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // Service pages
    ...SERVICE_SLUGS.map(slug => ({
      url: `${BASE}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...SERVICE_SLUGS.map(slug => ({
      url: `${BASE}/ar/services/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
