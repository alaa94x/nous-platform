// Case-study data layer. Reads the /work/[slug] content from the `projects`
// table (see migration 009) and maps a DB row to the shape CaseStudyPage
// renders. A seed of the three launch case studies is kept here so the pages
// still render if the migration has not been applied yet or Supabase is
// unreachable — the same seed-fallback pattern used elsewhere in the app.

export interface ResultMetric {
  metric: string
  value:  string
  note:   string
}

export interface CaseStudyProject {
  name:        string
  nameAr:      string
  tagline:     string
  taglineAr:   string
  year:        string
  tags:        string[]
  externalUrl: string | null
  services:    string[]
  servicesAr:  string[]
  overview:    string
  overviewAr:  string
  challenge:   string
  challengeAr: string
  solution:    string
  solutionAr:  string
  results:     ResultMetric[]
  resultsAr:   ResultMetric[]
  tech:        string[]
  imageUrl:    string | null
}

// ── Seed fallback (mirrors the original hardcoded pages) ──────────────────────

const SEED: Record<string, CaseStudyProject> = {
  'stitched': {
    name: 'Stitched',
    nameAr: 'ستيتشد',
    tagline: 'Premium fashion e-commerce for the Qatar market.',
    taglineAr: 'تجربة تجارة إلكترونية راقية للأزياء في السوق القطري.',
    year: '2024',
    tags: ['E-Commerce', 'Shopify', 'Headless', 'Design'],
    externalUrl: 'https://stitchedqa.com',
    services: ['E-Commerce Solutions', 'Full-Stack Engineering', 'Design & Motion'],
    servicesAr: ['حلول التجارة الإلكترونية', 'هندسة البرمجيات المتكاملة', 'التصميم والحركة'],
    overview:
      'Stitched is a Doha-based premium fashion brand serving customers across Qatar. Nous was brought in to design and build their full e-commerce experience, from brand identity and storefront design through to the technical build on Shopify.',
    overviewAr: 'ستيتشد علامة أزياء راقية مقرها الدوحة وتخدم العملاء في أنحاء قطر. تولّت نوس تصميم وبناء تجربة التجارة الإلكترونية كاملة، من الهوية وتصميم واجهة المتجر إلى التنفيذ التقني على شوبيفاي.',
    challenge:
      'The client needed a bilingual (Arabic/English) storefront that felt premium and editorial, integrated with their existing CRM and inventory systems, and optimized for mobile-first Gulf shoppers who primarily use WhatsApp for post-purchase support.',
    challengeAr: 'احتاج العميل إلى متجر ثنائي اللغة بطابع تحريري راقٍ، متكامل مع أنظمة إدارة العملاء والمخزون، ومهيأ لمتسوقي الخليج الذين يعتمدون على الجوال وواتساب لخدمة ما بعد الشراء.',
    solution:
      'We built a custom headless Shopify storefront using Next.js, with a fully RTL-capable Arabic layout and automated WhatsApp order notifications via the Twilio API. The design system uses a restrained dark palette with editorial typography to reflect the brand\'s premium positioning.',
    solutionAr: 'بنينا واجهة شوبيفاي مخصصة بلا رأس باستخدام Next.js، مع تجربة عربية أصلية من اليمين إلى اليسار وتنبيهات طلبات آلية عبر واتساب باستخدام Twilio. ويعكس نظام التصميم مكانة العلامة الراقية من خلال ألوان داكنة منضبطة وطباعة تحريرية.',
    results: [
      { metric: 'Storefront live', value: '6 weeks', note: 'from brief to launch' },
      { metric: 'Mobile sessions', value: '78%', note: 'of all traffic' },
      { metric: 'Bilingual', value: 'AR + EN', note: 'full RTL support' },
    ],
    resultsAr: [
      { metric: 'إطلاق المتجر', value: '٦ أسابيع', note: 'من الموجز إلى الإطلاق' },
      { metric: 'جلسات الجوال', value: '٪٧٨', note: 'من إجمالي الزيارات' },
      { metric: 'ثنائي اللغة', value: 'ع + EN', note: 'دعم كامل للاتجاهين' },
    ],
    tech: ['Next.js', 'Shopify', 'Headless Commerce', 'Twilio', 'PostgreSQL', 'Figma'],
    imageUrl: null,
  },
  'elite-collections': {
    name: 'Elite Collections',
    nameAr: 'إيليت كوليكشنز',
    tagline: 'Luxury retail, digitized for Doha.',
    taglineAr: 'تجربة رقمية لتجارة التجزئة الفاخرة في الدوحة.',
    year: '2024',
    tags: ['Web', 'Design', 'E-Commerce', 'Full-Stack'],
    externalUrl: null,
    services: ['Full-Stack Engineering', 'Design & Motion', 'E-Commerce Solutions'],
    servicesAr: ['هندسة البرمجيات المتكاملة', 'التصميم والحركة', 'حلول التجارة الإلكترونية'],
    overview:
      'Elite Collections is a luxury retail brand based in Doha, Qatar. Nous designed and built their complete digital presence, encompassing brand identity, a curated product catalog, and an appointment booking system for private shopping experiences.',
    overviewAr: 'إيليت كوليكشنز علامة تجزئة فاخرة مقرها الدوحة. صممت نوس حضورها الرقمي الكامل، بما يشمل الهوية ودليل منتجات منتقى ونظام حجز مواعيد لتجارب تسوق خاصة.',
    challenge:
      'Luxury retail in the Gulf market demands a digital presence that matches the in-store experience: unhurried, exclusive, and visually immaculate. The brand needed a bilingual platform that communicated prestige without being cold, and that funneled high-intent buyers toward private appointments rather than impulsive checkouts.',
    challengeAr: 'تتطلب تجارة التجزئة الفاخرة في الخليج حضوراً رقمياً يوازي تجربة المتجر: هادئاً وحصرياً ومتقناً بصرياً. احتاجت العلامة إلى منصة ثنائية اللغة تعبّر عن الفخامة بإنسانية وتوجه العملاء الجادين نحو المواعيد الخاصة.',
    solution:
      'We built a custom Next.js platform with a restrained editorial design system, a Supabase-powered product catalog manageable from a custom admin, and a Calendly-integrated private appointment booking flow. The Arabic version was built RTL-native, not retrofitted.',
    solutionAr: 'بنينا منصة مخصصة باستخدام Next.js بنظام تصميم تحريري منضبط، ودليل منتجات يعتمد على Supabase ويمكن إدارته من لوحة مخصصة، ومسار حجز خاص متكامل مع Calendly. صُممت النسخة العربية من البداية للاتجاه من اليمين إلى اليسار.',
    results: [
      { metric: 'Launch timeline', value: '8 weeks', note: 'design to production' },
      { metric: 'Languages', value: '2', note: 'Arabic + English, both native' },
      { metric: 'Admin panel', value: 'Custom', note: 'no third-party CMS dependency' },
    ],
    resultsAr: [
      { metric: 'مدة الإطلاق', value: '٨ أسابيع', note: 'من التصميم إلى الإنتاج' },
      { metric: 'اللغات', value: '٢', note: 'العربية والإنجليزية بشكل أصلي' },
      { metric: 'لوحة الإدارة', value: 'مخصصة', note: 'بلا اعتماد على نظام خارجي' },
    ],
    tech: ['Next.js', 'Supabase', 'Tailwind CSS', 'Calendly API', 'Figma', 'Framer'],
    imageUrl: null,
  },
  'the-seventh-sense': {
    name: 'The Seventh Sense',
    nameAr: 'الحاسة السابعة',
    tagline: 'An immersive brand experience platform.',
    taglineAr: 'منصة غامرة لتجربة العلامة.',
    year: '2025',
    tags: ['Design', 'Motion', 'Full-Stack', 'Brand'],
    externalUrl: null,
    services: ['Design & Motion', 'Full-Stack Engineering', 'Artificial Intelligence'],
    servicesAr: ['التصميم والحركة', 'هندسة البرمجيات المتكاملة', 'الذكاء الاصطناعي'],
    overview:
      'The Seventh Sense is a creative brand based in Doha, Qatar. Nous designed and developed their digital platform, an immersive web experience that uses motion, 3D, and editorial typography to communicate the brand\'s identity in a way that static design cannot.',
    overviewAr: 'الحاسة السابعة علامة إبداعية مقرها الدوحة. صممت نوس وطورت منصتها الرقمية كتجربة ويب غامرة توظف الحركة والعناصر ثلاثية الأبعاد والطباعة التحريرية لتجسيد الهوية بما يتجاوز التصميم الساكن.',
    challenge:
      'The client wanted a web presence that felt like an experience, not a brochure. The brief called for cinematic-quality motion, bilingual content, and a CMS that a non-technical team could use to update the site without breaking the design.',
    challengeAr: 'أراد العميل حضوراً رقمياً يُعاش كتجربة لا كمنشور تعريفي. تطلب الموجز حركة بجودة سينمائية ومحتوى ثنائي اللغة ونظام إدارة يستطيع الفريق غير التقني استخدامه دون التأثير في التصميم.',
    solution:
      'We built a Next.js platform with GSAP ScrollTrigger for scroll-driven narrative sequences, Three.js for 3D ambient elements, and a custom Supabase-backed CMS with a locked design system so editors can change content without touching layout. All motion respects prefers-reduced-motion.',
    solutionAr: 'بنينا منصة Next.js تستخدم GSAP ScrollTrigger للسرد المتحرك مع التمرير وThree.js للعناصر المحيطية ثلاثية الأبعاد، مع نظام إدارة مخصص يعتمد على Supabase ونظام تصميم محمي. كما تحترم جميع الحركات تفضيل تقليل الحركة.',
    results: [
      { metric: 'Motion budget', value: '< 280KB', note: 'compressed JS for animations' },
      { metric: 'Accessibility', value: 'WCAG AA', note: 'including reduced-motion path' },
      { metric: 'CMS adoption', value: '100%', note: 'team self-sufficient from day one' },
    ],
    resultsAr: [
      { metric: 'حجم الحركة', value: '< ٢٨٠KB', note: 'جافاسكربت مضغوط للحركات' },
      { metric: 'إتاحة الوصول', value: 'WCAG AA', note: 'بما في ذلك تقليل الحركة' },
      { metric: 'تبني النظام', value: '٪١٠٠', note: 'استقلالية الفريق منذ اليوم الأول' },
    ],
    tech: ['Next.js', 'GSAP', 'Three.js', 'Supabase', 'Tailwind CSS', 'Figma'],
    imageUrl: null,
  },
}

const SEED_SLUGS = Object.keys(SEED)

// ── DB row shape (only the columns we read) ──────────────────────────────────

interface ProjectRow {
  name:          string
  name_ar:       string | null
  tagline:       string | null
  tagline_ar:    string | null
  year:          string | null
  tags:          string[] | null
  external_url:  string | null
  services:      string[] | null
  services_ar:   string[] | null
  overview:      string | null
  overview_ar:   string | null
  challenge:     string | null
  challenge_ar:  string | null
  solution:      string | null
  solution_ar:   string | null
  results:       ResultMetric[] | null
  results_ar:    ResultMetric[] | null
  tech:          string[] | null
  image_url:     string | null
  slug:          string | null
  is_case_study: boolean | null
}

const PROJECT_COLUMNS =
  'name, name_ar, tagline, tagline_ar, year, tags, external_url, services, services_ar, overview, overview_ar, challenge, challenge_ar, solution, solution_ar, results, results_ar, tech, image_url, slug, is_case_study'

function mapRow(row: ProjectRow): CaseStudyProject {
  return {
    name:        row.name,
    nameAr:      row.name_ar ?? '',
    tagline:     row.tagline ?? '',
    taglineAr:   row.tagline_ar ?? row.tagline ?? '',
    year:        row.year ?? '',
    tags:        row.tags ?? [],
    externalUrl: row.external_url ?? null,
    services:    row.services ?? [],
    servicesAr:  row.services_ar?.length ? row.services_ar : (row.services ?? []),
    overview:    row.overview ?? '',
    overviewAr:  row.overview_ar ?? row.overview ?? '',
    challenge:   row.challenge ?? '',
    challengeAr: row.challenge_ar ?? row.challenge ?? '',
    solution:    row.solution ?? '',
    solutionAr:  row.solution_ar ?? row.solution ?? '',
    results:     Array.isArray(row.results) ? row.results : [],
    resultsAr:   Array.isArray(row.results_ar) && row.results_ar.length ? row.results_ar : (Array.isArray(row.results) ? row.results : []),
    tech:        row.tech ?? [],
    imageUrl:    row.image_url ?? null,
  }
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('your-project')) return null
  return { url, key }
}

async function withTimeout<T>(p: PromiseLike<T>, ms = 4000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Supabase request timed out')), ms),
  )
  return Promise.race([p, timeout])
}

// Returns the case study for a slug, DB first, seed fallback. null = 404.
export async function getCaseStudy(slug: string): Promise<CaseStudyProject | null> {
  const creds = getClient()
  if (creds) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(creds.url, creds.key, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data } = await withTimeout(
        supabase
          .from('projects')
          .select(PROJECT_COLUMNS)
          .eq('slug', slug)
          .eq('is_case_study', true)
          .eq('active', true)
          .maybeSingle(),
      )
      // Only trust the DB row if it actually carries case-study content.
      if (data && (data as ProjectRow).overview) return mapRow(data as ProjectRow)
    } catch {
      /* fall through to seed */
    }
  }
  return SEED[slug] ?? null
}

// All case-study slugs (DB ∪ seed) for generateStaticParams / sitemap.
export async function getCaseStudySlugs(): Promise<string[]> {
  const creds = getClient()
  if (creds) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(creds.url, creds.key, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data } = await withTimeout(
        supabase
          .from('projects')
          .select('slug')
          .eq('is_case_study', true)
          .eq('active', true)
          .not('slug', 'is', null),
      )
      const dbSlugs = ((data as { slug: string | null }[] | null) ?? [])
        .map(r => r.slug)
        .filter((s): s is string => Boolean(s))
      if (dbSlugs.length > 0) return Array.from(new Set([...dbSlugs, ...SEED_SLUGS]))
    } catch {
      /* fall through to seed */
    }
  }
  return SEED_SLUGS
}
