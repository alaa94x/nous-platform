import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer, { DEFAULT_CONTACT_ITEMS, DEFAULT_SOCIAL_ITEMS } from '@/sections/footer/Footer'
import CaseStudyPage from '@/sections/work/CaseStudyPage'

export const metadata: Metadata = {
  title: 'The Seventh Sense — Case Study',
  description:
    'How Nous built The Seventh Sense digital platform — an immersive brand experience and web presence for a creative studio in Doha, Qatar.',
  alternates: { canonical: 'https://nous.qa/work/the-seventh-sense' },
  openGraph: {
    title: 'The Seventh Sense — Case Study | Nous',
    description: 'Immersive brand experience and web presence built by Nous in Doha, Qatar.',
    url: 'https://nous.qa/work/the-seventh-sense',
    type: 'article',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'The Seventh Sense — Brand Experience Platform',
  url: 'https://nous.qa/work/the-seventh-sense',
  creator: {
    '@type': 'Organization',
    name: 'Nous',
    url: 'https://nous.qa',
  },
  description:
    'An immersive brand experience platform for The Seventh Sense, featuring GSAP-driven animations, Three.js 3D elements, and a custom CMS — designed and developed by Nous in Doha, Qatar.',
  keywords: ['brand experience', 'creative studio', 'GSAP', 'Three.js', 'Qatar', 'Doha', 'motion design'],
  inLanguage: ['en', 'ar'],
}

const project = {
  name: 'The Seventh Sense',
  nameAr: 'الحاسة السابعة',
  tagline: 'An immersive brand experience platform.',
  year: '2025',
  tags: ['Design', 'Motion', 'Full-Stack', 'Brand'],
  externalUrl: null,
  services: ['Design & Motion', 'Full-Stack Engineering', 'Artificial Intelligence'],
  overview:
    'The Seventh Sense is a creative brand based in Doha, Qatar. Nous designed and developed their digital platform — an immersive web experience that uses motion, 3D, and editorial typography to communicate the brand\'s identity in a way that static design cannot.',
  challenge:
    'The client wanted a web presence that felt like an experience, not a brochure. The brief called for cinematic-quality motion, bilingual content, and a CMS that a non-technical team could use to update the site without breaking the design.',
  solution:
    'We built a Next.js platform with GSAP ScrollTrigger for scroll-driven narrative sequences, Three.js for 3D ambient elements, and a custom Supabase-backed CMS with a locked design system so editors can change content without touching layout. All motion respects prefers-reduced-motion.',
  results: [
    { metric: 'Motion budget', value: '< 280KB', note: 'compressed JS for animations' },
    { metric: 'Accessibility', value: 'WCAG AA', note: 'including reduced-motion path' },
    { metric: 'CMS adoption', value: '100%', note: 'team self-sufficient from day one' },
  ],
  tech: ['Next.js', 'GSAP', 'Three.js', 'Supabase', 'Tailwind CSS', 'Figma'],
  imageUrl: null,
}

export default function SeventhSenseCase() {
  return (
    <>
      <Cursor />
      <Noise />
      <Nav siteName="nous." />
      <main id="main-content">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CaseStudyPage project={project} />
      </main>
      <Footer
        siteName="nous."
        companyName="Nous"
        contactItems={DEFAULT_CONTACT_ITEMS}
        socialItems={DEFAULT_SOCIAL_ITEMS}
      />
    </>
  )
}
