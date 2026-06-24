import type { Metadata } from 'next'
import Nav     from '@/components/nav/Nav'
import Cursor  from '@/components/cursor/Cursor'
import Noise   from '@/components/noise/Noise'
import ContactPage from '@/sections/contact/ContactPage'

export const revalidate = 60

export const metadata: Metadata = {
  title:       'Start a Project',
  description: 'Tell us what you are building. We reply to all inquiries within 24 hours. AI, web, mobile, and e-commerce development in Doha, Qatar.',
  alternates:  { canonical: 'https://nous.qa/contact' },
  openGraph: {
    title:       'Start a Project — Nous',
    description: 'Tell us what you are building. We reply within 24 hours.',
    url:         'https://nous.qa/contact',
    siteName:    'Nous',
    locale:      'en_US',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Start a Project — Nous',
    description: 'Tell us what you are building. We reply within 24 hours.',
  },
}

// ── Seed defaults (mirrors page.tsx) ──────────────────────────────────────────

const SEED_SETTINGS: Record<string, string> = {
  site_name:     'nous.',
  contact_email: 'nouslab@icould.com',
}

const SEED_SERVICES = [
  { id: '1', idx: '01', name: 'Artificial Intelligence', category: 'ML · AI',        tech_pills: ['LLMs', 'RAG', 'TensorFlow', 'PyTorch', 'NLP', 'Agents'] },
  { id: '2', idx: '02', name: 'Full-Stack Engineering',  category: 'Web · API',      tech_pills: ['React', 'Next.js', 'Node.js', 'Go', 'Python', 'PostgreSQL'] },
  { id: '3', idx: '03', name: 'Mobile Development',      category: 'iOS · Android',  tech_pills: ['React Native', 'Swift', 'Flutter', 'Kotlin', 'PWA'] },
  { id: '4', idx: '04', name: 'E-Commerce Solutions',    category: 'Retail · SaaS',  tech_pills: ['Shopify', 'Headless', 'Stripe', 'WooCommerce', 'CRM'] },
  { id: '5', idx: '05', name: 'Cloud Infrastructure',    category: 'DevOps · Scale', tech_pills: ['AWS', 'GCP', 'Docker', 'K8s', 'Terraform', 'CI/CD'] },
  { id: '6', idx: '06', name: 'Design & Motion',         category: 'UX · Visual',    tech_pills: ['Figma', 'Framer', 'GSAP', 'Three.js', 'Motion Design'] },
]

async function getContactData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('your-project')) {
    return { settings: SEED_SETTINGS, services: SEED_SERVICES }
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const [{ data: rawSettings }, { data: services }] = await Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase.from('services').select('id, idx, name, category, tech_pills').eq('active', true).order('sort_order'),
    ])

    const settings = { ...SEED_SETTINGS }
    for (const row of (rawSettings as { key: string; value: string }[] | null) ?? []) {
      if (row.value) settings[row.key] = row.value
    }

    return {
      settings,
      services: services && services.length > 0 ? services : SEED_SERVICES,
    }
  } catch {
    return { settings: SEED_SETTINGS, services: SEED_SERVICES }
  }
}

export default async function Contact() {
  const { settings: s, services } = await getContactData()

  return (
    <>
      <Cursor />
      <Noise />
      <Nav siteName={s['site_name']} variant="contact" />
      <main id="main-content">
        <ContactPage services={services} contactEmail={s['contact_email']} />
      </main>
    </>
  )
}
