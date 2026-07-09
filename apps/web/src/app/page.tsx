import Nav                from '@/components/nav/Nav'
import Cursor             from '@/components/cursor/Cursor'
import Noise              from '@/components/noise/Noise'
import Hero               from '@/sections/hero/Hero'
import Capabilities       from '@/sections/capabilities/Capabilities'
import Works              from '@/sections/works/Works'
import About, { faqs }    from '@/sections/about/About'
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
  // Blank by default so the Footer auto-generates "© YEAR Company"; admin can
  // set a verbatim override in Settings. (footer_location / footer_badge were
  // vestigial keys nothing rendered, removed.)
  footer_copyright:   '',
}

const SEED_SERVICES = [
  { id: '1', idx: '01', name: 'AI & Automation',          name_tech: 'Artificial Intelligence', category: 'ML · AI',        business_tags: ['Experience', 'Automation'], engineering_tags: ['ML', 'AI'],        business_outcomes: ['Smarter Decisions', 'Automation', 'Predictive Insight', 'Cost Reduction'], engineering_stack: ['LLMs', 'RAG', 'TensorFlow', 'PyTorch', 'NLP', 'Agents'] },
  { id: '2', idx: '02', name: 'Custom Digital Platforms', name_tech: 'Full-Stack Engineering',  category: 'Web · API',      business_tags: ['Growth', 'Conversion'],      engineering_tags: ['Web', 'API'],      business_outcomes: ['Custom Portals', 'Fast Delivery', 'Zero Downtime', 'High Conversion'],    engineering_stack: ['React', 'Next.js', 'Node.js', 'Go', 'Python', 'PostgreSQL'] },
  { id: '3', idx: '03', name: 'Mobile Apps',              name_tech: 'Mobile Development',      category: 'iOS · Android',  business_tags: ['Reach', 'Engagement'],       engineering_tags: ['iOS', 'Android'],  business_outcomes: ['Reach More Users', 'Native Speed', 'Offline-Ready', 'App Store Ready'],     engineering_stack: ['React Native', 'Swift', 'Flutter', 'Kotlin', 'PWA'] },
  { id: '4', idx: '04', name: 'Online Commerce',          name_tech: 'E-Commerce Solutions',    category: 'Retail · SaaS',  business_tags: ['Revenue', 'Loyalty'],        engineering_tags: ['Retail', 'SaaS'],  business_outcomes: ['More Revenue', 'Loyal Customers', 'Seamless Checkout', 'Global Scale'],     engineering_stack: ['Shopify', 'Headless', 'Stripe', 'WooCommerce', 'CRM'] },
  { id: '5', idx: '05', name: 'Cloud & Scale',            name_tech: 'Cloud Infrastructure',    category: 'DevOps · Scale', business_tags: ['Reliability', 'Scale'],      engineering_tags: ['DevOps', 'Cloud'], business_outcomes: ['Always On', 'Instant Scale', 'Secure by Design', 'Lower Costs'],           engineering_stack: ['AWS', 'GCP', 'Docker', 'K8s', 'Terraform', 'CI/CD'] },
  { id: '6', idx: '06', name: 'Design & Brand',           name_tech: 'Design & Motion',         category: 'UX · Visual',    business_tags: ['Brand', 'Identity'],         engineering_tags: ['UX', 'Visual'],    business_outcomes: ['Memorable Brand', 'Clear Communication', 'Delight Users', 'Stand Out'],     engineering_stack: ['Figma', 'Framer', 'GSAP', 'Three.js', 'Motion Design'] },
]

// Real data lives in Supabase — run migration 006_seed_real_projects.sql
const SEED_PROJECTS: { id: string; name: string; name_ar: string; description: string; year: string; tags: string[]; image_url: string | null; url: string | null }[] = []

// Real data lives in Supabase — run migration 008_testimonials.sql
const SEED_TESTIMONIALS: { quote: string; author: string; role: string | null; initials: string | null }[] = [
  {
    quote:
      'Nous delivered our Shopify storefront in six weeks, start to finish. The Arabic RTL layout was flawless on day one, and the team communicated clearly throughout. We would not build with anyone else in Qatar.',
    author: 'Founder',
    role: 'Stitched',
    initials: 'S',
  },
  {
    quote:
      'We needed a platform that felt as premium as our in-store experience. Nous understood that immediately. The result is a site that earns the trust of our customers before they even read the copy.',
    author: 'Director',
    role: 'Elite Collections',
    initials: 'E',
  },
  {
    quote:
      'The team at Nous built us a custom CMS that our non-technical staff adopted on day one. The site performs beautifully on mobile, which is where 90 percent of our visitors are.',
    author: 'Creative Lead',
    role: 'The Seventh Sense',
    initials: 'T',
  },
]

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getPageData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Public homepage read — the anon key is sufficient (see the public_read_*
  // policies in supabase/migrations/001_rls_policies.sql). The service role
  // key bypasses RLS entirely and has no business being used for a plain
  // public content fetch.
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const fallback = { settings: SEED_SETTINGS, services: SEED_SERVICES, projects: SEED_PROJECTS, testimonials: SEED_TESTIMONIALS }

  if (!url || !key || url.includes('your-project')) {
    return fallback
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const query = Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase.from('services').select('id, idx, name, name_ar, name_tech, name_tech_ar, category, tech_pills, business_pills, business_tags, engineering_tags, business_outcomes, engineering_stack, business_subtext').eq('active', true).order('sort_order'),
      supabase.from('projects').select('id, name, name_ar, description, year, tags, image_url, url, slug, is_case_study').eq('active', true).order('sort_order'),
      supabase.from('testimonials').select('quote, author, role, initials').eq('active', true).order('sort_order'),
    ])
    // A slow/hanging connection shouldn't be able to stall the whole page —
    // give up and serve seed data if Supabase doesn't answer in time.
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out')), 4000),
    )

    const [{ data: rawSettings }, { data: services }, { data: projects }, { data: testimonials }] = await Promise.race([query, timeout])

    // Merge DB settings over seeds so missing keys still have defaults
    const settings = { ...SEED_SETTINGS }
    for (const row of (rawSettings as { key: string; value: string }[] | null) ?? []) {
      if (row.value) settings[row.key] = row.value
    }

    // The projects select asks for slug/is_case_study (migration 009). If that
    // migration hasn't been applied yet those columns don't exist and the query
    // returns null — fall back to the base columns so the Works grid never
    // empties during the deploy → migrate window.
    let projectRows = projects
    if (!projectRows) {
      const { data } = await supabase
        .from('projects')
        .select('id, name, name_ar, description, year, tags, image_url, url')
        .eq('active', true)
        .order('sort_order')
      // slug/is_case_study are optional on the consumer; base rows are fine.
      projectRows = data as typeof projects
    }

    return {
      settings,
      services: (services && services.length > 0) ? services : SEED_SERVICES,
      projects: (projectRows && projectRows.length > 0) ? projectRows : SEED_PROJECTS,
      testimonials: (testimonials && testimonials.length > 0) ? testimonials : SEED_TESTIMONIALS,
    }
  } catch {
    return fallback
  }
}

// ── Structured data ───────────────────────────────────────────────────────────
// Built from the same `faqs` array About.tsx renders, so the JSON-LD can never
// drift out of sync with the visible "Common Questions" content.

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { settings: s, services, projects, testimonials } = await getPageData()

  // Parse footer JSON config with fallback to defaults
  let contactItems: ContactItem[] = DEFAULT_CONTACT_ITEMS
  let socialItems:  SocialItem[]  = DEFAULT_SOCIAL_ITEMS
  try {
    if (s['footer_contact_items']) contactItems = JSON.parse(s['footer_contact_items'])
    if (s['footer_social_items'])  socialItems  = JSON.parse(s['footer_social_items'])
  } catch { /* use defaults */ }

  return (
    <>
      {/* Hero image preloads — homepage-only, hoisted to <head> by Next.js.
          These used to live in the root layout and preloaded on every route,
          competing with each page's own critical resources for no benefit. */}
      <link rel="preload" as="image" href="/hero-1920.avif" type="image/avif" />
      <link
        rel="preload"
        as="image"
        href="/hero-1920.webp"
        type="image/webp"
        // @ts-expect-error — imagesrcset is valid HTML but not in React's type defs yet
        imagesrcset="/hero-828.webp 828w, /hero-1200.webp 1200w, /hero-1920.webp 1920w"
        imagesizes="100vw"
      />
      {/* FAQPage JSON-LD — only valid here, since the "Common Questions"
          content it describes is only visible on the homepage (see About.tsx). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
          <Testimonials testimonials={testimonials} />
        </SectionBoundary>
        <SectionBoundary name="how-we-work">
          <HowWeWork />
        </SectionBoundary>
        <SectionBoundary name="contact">
          <ContactCTA contactEmail={s['contact_email']} />
        </SectionBoundary>
      </main>
      <Footer
        siteName        = {s['site_name']}
        companyName     = {s['company_name'] ?? 'Nous'}
        contactItems    = {contactItems}
        socialItems     = {socialItems}
        footerCopyright = {s['footer_copyright'] || undefined}
      />
    </>
  )
}
