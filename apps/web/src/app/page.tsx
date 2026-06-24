import Nav                from '@/components/nav/Nav'
import Cursor             from '@/components/cursor/Cursor'
import Noise              from '@/components/noise/Noise'
import Hero               from '@/sections/hero/Hero'
import Capabilities       from '@/sections/capabilities/Capabilities'
import Works              from '@/sections/works/Works'
import About              from '@/sections/about/About'
import Testimonials       from '@/sections/testimonials/Testimonials'
import HowWeWork          from '@/sections/howwework/HowWeWork'
import ContactCTA         from '@/sections/contact/ContactCTA'
import Footer, { DEFAULT_CONTACT_ITEMS, DEFAULT_SOCIAL_ITEMS } from '@/sections/footer/Footer'
import type { ContactItem, SocialItem } from '@/sections/footer/Footer'
import { SectionBoundary } from '@/components/SectionBoundary'

// ISR: cache for 60s — admin changes reflect on next revalidation.
// Call revalidatePath('/') in admin API routes after content changes.
export const revalidate = 60

// ── Seed defaults ─────────────────────────────────────────────────────────────

const SEED_SETTINGS: Record<string, string> = {
  site_name:          'nous.',
  hero_headline_en:   'Engineered Intelligence',
  hero_headline_ar:   'نُهندِس الذكاء',
  hero_subtext_en:    'Transforming complex visions into intelligent systems and quiet luxury interfaces. We design and develop websites and apps that deliver true value, dedicating ourselves to excellence and embodying mastery in every detail.',
  hero_subtext_ar:    'نحوّل الرؤى المعقدة إلى أنظمة ذكية وواجهات فاخرة. نصمم ونطور مواقع وتطبيقات تقدم قيمة حقيقية، ونكرس جهودنا لنمنحك التميز، مجسدين معاني الإتقان والإحسان في كل تفصيل.',
  hero_location:      'Doha, Qatar · 2026',
  hero_cta_primary:   'Initialize Project',
  hero_cta_secondary: 'View Selected Works',
  contact_email:      'nouslab@icould.com',
  footer_location:    'Qatar · 2026',
  footer_copyright:   '© 2025 Nous. All Rights Reserved.',
  footer_badge:       'AN NOUS MASTERPIECE ✦ AN NOUS MASTERPIECE ✦ ',
}

const SEED_SERVICES = [
  { id: '1', idx: '01', name: 'Artificial Intelligence', category: 'ML · AI',        tech_pills: ['LLMs', 'RAG', 'TensorFlow', 'PyTorch', 'NLP', 'Agents'] },
  { id: '2', idx: '02', name: 'Full-Stack Engineering',  category: 'Web · API',      tech_pills: ['React', 'Next.js', 'Node.js', 'Go', 'Python', 'PostgreSQL'] },
  { id: '3', idx: '03', name: 'Mobile Development',      category: 'iOS · Android',  tech_pills: ['React Native', 'Swift', 'Flutter', 'Kotlin', 'PWA'] },
  { id: '4', idx: '04', name: 'E-Commerce Solutions',    category: 'Retail · SaaS',  tech_pills: ['Shopify', 'Headless', 'Stripe', 'WooCommerce', 'CRM'] },
  { id: '5', idx: '05', name: 'Cloud Infrastructure',    category: 'DevOps · Scale', tech_pills: ['AWS', 'GCP', 'Docker', 'K8s', 'Terraform', 'CI/CD'] },
  { id: '6', idx: '06', name: 'Design & Motion',         category: 'UX · Visual',    tech_pills: ['Figma', 'Framer', 'GSAP', 'Three.js', 'Motion Design'] },
]

// Real data lives in Supabase — run migration 006_seed_real_projects.sql
const SEED_PROJECTS: { id: string; name: string; name_ar: string; description: string; year: string; tags: string[]; image_url: string | null; url: string | null }[] = []

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getPageData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('your-project')) {
    return { settings: SEED_SETTINGS, services: SEED_SERVICES, projects: SEED_PROJECTS }
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const [{ data: rawSettings }, { data: services }, { data: projects }] = await Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase.from('services').select('id, idx, name, name_ar, category, tech_pills').eq('active', true).order('sort_order'),
      supabase.from('projects').select('id, name, name_ar, description, year, tags, image_url, url').eq('active', true).order('sort_order'),
    ])

    // Merge DB settings over seeds so missing keys still have defaults
    const settings = { ...SEED_SETTINGS }
    for (const row of (rawSettings as { key: string; value: string }[] | null) ?? []) {
      if (row.value) settings[row.key] = row.value
    }

    return {
      settings,
      services: (services && services.length > 0) ? services : SEED_SERVICES,
      projects: (projects && projects.length > 0) ? projects : SEED_PROJECTS,
    }
  } catch {
    return { settings: SEED_SETTINGS, services: SEED_SERVICES, projects: SEED_PROJECTS }
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { settings: s, services, projects } = await getPageData()

  // Parse footer JSON config with fallback to defaults
  let contactItems: ContactItem[] = DEFAULT_CONTACT_ITEMS
  let socialItems:  SocialItem[]  = DEFAULT_SOCIAL_ITEMS
  try {
    if (s['footer_contact_items']) contactItems = JSON.parse(s['footer_contact_items'])
    if (s['footer_social_items'])  socialItems  = JSON.parse(s['footer_social_items'])
  } catch { /* use defaults */ }

  return (
    <>
      <Cursor />
      <Noise />
      <Nav siteName={s['site_name']} />
      <main id="main-content">
        <SectionBoundary name="hero">
          <Hero
            headlineEn     = {s['hero_headline_en']}
            headlineAr     = {s['hero_headline_ar']}
            subtextEn      = {s['hero_subtext_en']}
            subtextAr      = {s['hero_subtext_ar']}
            ctaPrimary     = {s['hero_cta_primary']}
            ctaSecondary   = {s['hero_cta_secondary']}
          />
        </SectionBoundary>
        <SectionBoundary name="capabilities">
          <Capabilities services={services} />
        </SectionBoundary>
        <SectionBoundary name="works">
          <Works projects={projects} />
        </SectionBoundary>
        <SectionBoundary name="about">
          <About />
        </SectionBoundary>
        <SectionBoundary name="testimonials">
          <Testimonials />
        </SectionBoundary>
        <SectionBoundary name="how-we-work">
          <HowWeWork />
        </SectionBoundary>
        <SectionBoundary name="contact">
          <ContactCTA />
        </SectionBoundary>
      </main>
      <Footer
        siteName      = {s['site_name']}
        companyName   = {s['company_name'] ?? 'Nous'}
        contactItems  = {contactItems}
        socialItems   = {socialItems}
      />
    </>
  )
}
