const SEED_SETTINGS: Record<string, string> = {
  site_name: 'nous.',
  hero_eyebrow_en: 'Nous — Digital Systems / Doha',
  hero_eyebrow_ar: 'نوس — أنظمة رقمية / الدوحة',
  hero_headline_en: 'We make complex systems feel clear.',
  hero_headline_ar: 'نحوّل التعقيد إلى أنظمة واضحة.',
  hero_subtext_en: 'Strategy, software and intelligent products built by a senior Doha team—from first decision to live system.',
  hero_subtext_ar: 'استراتيجية وبرمجيات ومنتجات ذكية يبنيها فريق خبير في الدوحة — من القرار الأول حتى النظام العامل.',
  hero_location_en: 'Doha · Qatar',
  hero_location_ar: 'الدوحة · قطر',
  hero_cta_primary_en: 'Bring Us the Hard Problem',
  hero_cta_primary_ar: 'اعرض علينا التحدّي',
  hero_cta_secondary_en: 'Talk to us on WhatsApp',
  hero_cta_secondary_ar: 'تحدث معنا عبر واتساب',
  hero_motion_mode: 'standard',
  hero_reveal_1_en: 'Find the signal.',
  hero_reveal_1_ar: 'نجد الإشارة.',
  hero_reveal_2_en: 'Shape the system.',
  hero_reveal_2_ar: 'نصوغ النظام.',
  hero_reveal_3_en: 'Make it live.',
  hero_reveal_3_ar: 'نطلقه للحياة.',
  hero_reveal_hint_en: 'Move through the field to reveal the signal',
  hero_reveal_hint_ar: 'المس المجال لاكتشاف الإشارة',
  about_title_en: 'Why Nous',
  about_title_ar: 'لماذا نوس',
  about_body_en: 'Complex work does not need to feel complicated. We bring strategy, design and engineering into one senior team, so decisions stay connected from the first conversation to the live system.',
  about_body_ar: 'العمل المعقّد لا يجب أن يبدو معقّداً. نجمع الاستراتيجية والتصميم والهندسة في فريق خبير واحد، لتبقى القرارات مترابطة من الحوار الأول حتى النظام العامل.',
  about_note_en: 'Based in Doha. Bilingual by design. Deliberately small, so the people shaping the work remain close to it from start to finish.',
  about_note_ar: 'من الدوحة، وثنائي اللغة منذ التصميم. فريق صغير عن قصد، ليبقى من يصنع القرار قريباً من العمل حتى النهاية.',
  capabilities_label_en: '[ THE SYSTEMS ]',
  capabilities_label_ar: '[ الأنظمة ]',
  capabilities_title_en: 'What We Build',
  capabilities_title_ar: 'ما نبنيه',
  capabilities_subtitle_en: 'Six connected capabilities, viewed through business impact or engineering architecture.',
  capabilities_subtitle_ar: 'ست قدرات مترابطة، تُقرأ من منظور أثر الأعمال أو البنية الهندسية.',
  process_title_en: 'How the Work Moves',
  process_title_ar: 'كيف يتحرّك العمل',
  process_subtitle_en: 'One connected path from a difficult question to a dependable live system.',
  process_subtitle_ar: 'مسار واحد متصل من السؤال الصعب إلى نظام حي يمكن الاعتماد عليه.',
  process_engagement_title_en: 'Engagement Shapes',
  process_engagement_title_ar: 'أشكال التعاون',
  process_engagement_intro_en: 'The engagement shape follows what the system needs—not a preset package.',
  process_engagement_intro_ar: 'نختار شكل التعاون بحسب ما يحتاجه النظام، لا بحسب قالب جاهز.',
  works_label_en: '[ THE ARCHIVE ]',
  works_label_ar: '[ الأرشيف ]',
  works_title_en: 'Selected Work',
  works_title_ar: 'أعمال مختارة',
  works_intro_en: 'Real work, shown through the challenge, the intervention and the outcome.',
  works_intro_ar: 'مشاريع حقيقية، تُعرض من خلال التحدّي والتدخّل والنتيجة.',
  testimonials_label_en: 'What clients experienced',
  testimonials_label_ar: 'ما اختبره عملاؤنا',
  testimonials_title_en: 'Signals from the Work',
  testimonials_title_ar: 'أثر العمل',
  faq_label_en: 'Before We Begin',
  faq_label_ar: 'قبل أن نبدأ',
  faq_title_en: 'Direct Answers',
  faq_title_ar: 'إجابات مباشرة',
  faq_intro_en: 'The practical details, without the sales fog.',
  faq_intro_ar: 'التفاصيل العملية، بوضوح ومن دون مبالغة.',
  contact_title_en: 'Bring us the hard problem.',
  contact_title_ar: 'اعرض علينا التحدّي.',
  contact_support_en: "Tell us what is unclear, stuck or ambitious. We will reply with the most useful next step.",
  contact_support_ar: 'أخبرنا بما هو معقّد أو متعثّر أو طموح، وسنرد بالخطوة التالية الأكثر فائدة.',
  contact_cta_en: 'Start the Conversation',
  contact_cta_ar: 'ابدأ الحوار',
  contact_response_note_en: 'Reply within 24 hours',
  contact_response_note_ar: 'نرد خلال ٢٤ ساعة',
  contact_email: 'nouslab@icould.com',
  footer_copyright: '',
}

const SEED_SERVICES = [
  { id: '1', idx: '01', name: 'AI & Automation', name_ar: 'الذكاء الاصطناعي والأتمتة', name_tech: 'Artificial Intelligence', name_tech_ar: 'هندسة الذكاء الاصطناعي', category: 'ML · AI', business_tags: ['Experience', 'Automation'], engineering_tags: ['ML', 'AI'], business_outcomes: ['Smarter Decisions', 'Automation', 'Predictive Insight', 'Cost Reduction'], engineering_stack: ['LLMs', 'RAG', 'TensorFlow', 'PyTorch', 'NLP', 'Agents'] },
  { id: '2', idx: '02', name: 'Custom Digital Platforms', name_ar: 'منصات رقمية مخصصة', name_tech: 'Full-Stack Engineering', name_tech_ar: 'هندسة البرمجيات المتكاملة', category: 'Web · API', business_tags: ['Growth', 'Conversion'], engineering_tags: ['Web', 'API'], business_outcomes: ['Custom Portals', 'Fast Delivery', 'Zero Downtime', 'High Conversion'], engineering_stack: ['React', 'Next.js', 'Node.js', 'Go', 'Python', 'PostgreSQL'] },
  { id: '3', idx: '03', name: 'Mobile Apps', name_ar: 'تطبيقات الجوال', name_tech: 'Mobile Development', name_tech_ar: 'تطوير تطبيقات الجوال', category: 'iOS · Android', business_tags: ['Reach', 'Engagement'], engineering_tags: ['iOS', 'Android'], business_outcomes: ['Reach More Users', 'Native Speed', 'Offline-Ready', 'App Store Ready'], engineering_stack: ['React Native', 'Swift', 'Flutter', 'Kotlin', 'PWA'] },
  { id: '4', idx: '04', name: 'Online Commerce', name_ar: 'التجارة الإلكترونية', name_tech: 'E-Commerce Solutions', name_tech_ar: 'حلول التجارة الإلكترونية', category: 'Retail · SaaS', business_tags: ['Revenue', 'Loyalty'], engineering_tags: ['Retail', 'SaaS'], business_outcomes: ['More Revenue', 'Loyal Customers', 'Seamless Checkout', 'Global Scale'], engineering_stack: ['Shopify', 'Headless', 'Stripe', 'WooCommerce', 'CRM'] },
  { id: '5', idx: '05', name: 'Cloud & Scale', name_ar: 'السحابة والتوسع', name_tech: 'Cloud Infrastructure', name_tech_ar: 'البنية التحتية السحابية', category: 'DevOps · Scale', business_tags: ['Reliability', 'Scale'], engineering_tags: ['DevOps', 'Cloud'], business_outcomes: ['Always On', 'Instant Scale', 'Secure by Design', 'Lower Costs'], engineering_stack: ['AWS', 'GCP', 'Docker', 'K8s', 'Terraform', 'CI/CD'] },
  { id: '6', idx: '06', name: 'Design & Brand', name_ar: 'التصميم والهوية', name_tech: 'Design & Motion', name_tech_ar: 'التصميم والحركة', category: 'UX · Visual', business_tags: ['Brand', 'Identity'], engineering_tags: ['UX', 'Visual'], business_outcomes: ['Memorable Brand', 'Clear Communication', 'Delight Users', 'Stand Out'], engineering_stack: ['Figma', 'Framer', 'GSAP', 'Three.js', 'Motion Design'] },
]

const SEED_PROJECTS: Array<{
  id: string
  name: string
  name_ar: string
  description: string
  year: string
  tags: string[]
  image_url: string | null
  url: string | null
}> = []

const SEED_TESTIMONIALS = [
  { quote: 'Nous delivered our Shopify storefront in six weeks, start to finish. The Arabic RTL layout was flawless on day one, and the team communicated clearly throughout. We would not build with anyone else in Qatar.', author: 'Founder', role: 'Stitched', initials: 'S' },
  { quote: 'We needed a platform that felt as premium as our in-store experience. Nous understood that immediately. The result is a site that earns the trust of our customers before they even read the copy.', author: 'Director', role: 'Elite Collections', initials: 'E' },
  { quote: 'The team at Nous built us a custom CMS that our non-technical staff adopted on day one. The site performs beautifully on mobile, which is where 90 percent of our visitors are.', author: 'Creative Lead', role: 'The Seventh Sense', initials: 'T' },
]

const fallback = {
  settings: SEED_SETTINGS,
  services: SEED_SERVICES,
  projects: SEED_PROJECTS,
  testimonials: SEED_TESTIMONIALS,
}

export async function getHomePageData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('your-project')) return fallback

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const query = Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase.from('services').select('id, idx, name, name_ar, name_tech, name_tech_ar, category, tech_pills, business_pills, business_tags, engineering_tags, business_outcomes, engineering_stack, business_subtext, business_subtext_ar').eq('active', true).order('sort_order'),
      supabase.from('projects').select('id, name, name_ar, description, description_ar, year, tags, image_url, url, slug, is_case_study').eq('active', true).order('sort_order'),
      supabase.from('testimonials').select('quote, quote_ar, author, author_ar, role, role_ar, initials').eq('active', true).order('sort_order'),
    ])
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out')), 4000),
    )
    const [{ data: rawSettings }, { data: services }, { data: projects }, { data: testimonials }] = await Promise.race([query, timeout])

    const settings = { ...SEED_SETTINGS }
    for (const row of (rawSettings as { key: string; value: string }[] | null) ?? []) {
      if (row.value) settings[row.key] = row.value
    }

    let projectRows = projects
    if (!projectRows) {
      const { data } = await supabase
        .from('projects')
        .select('id, name, name_ar, description, year, tags, image_url, url')
        .eq('active', true)
        .order('sort_order')
      projectRows = data as typeof projects
    }

    return {
      settings,
      services: services?.length ? services : SEED_SERVICES,
      projects: projectRows?.length ? projectRows : SEED_PROJECTS,
      testimonials: testimonials?.length ? testimonials : SEED_TESTIMONIALS,
    }
  } catch {
    return fallback
  }
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>
