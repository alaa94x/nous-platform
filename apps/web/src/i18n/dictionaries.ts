import type { Locale } from './config'

export interface HomeDictionary {
  locale: Locale
  direction: 'ltr' | 'rtl'
  nav: {
    capabilities: string
    proof: string
    contact: string
    switchLabel: string
    mobileStart: string
  }
  hero: {
    eyebrow: string
    headline: string
    subtext: string
    primary: string
    secondary: string
    location: string
    signal: string
    responsive: string
    footer: string[]
    scroll: string
  }
  about: {
    title: string
    body: string
    note: string
  }
  capabilities: {
    label: string
    title: string
    subtitle: string
    business: string
    engineering: string
    explore: string
    openService: string
  }
  process: {
    title: string
    subtitle: string
    engagementTitle: string
    steps: Array<{ label: string; heading: string; body: string }>
    engagements: Array<{ type: string; description: string }>
  }
  works: {
    label: string
    title: string
    empty: string
  }
  testimonials: {
    title: string
    items: Array<{ quote: string; author: string; role: string; initials: string }>
  }
  faq: {
    label: string
    title: string
    items: Array<{ q: string; a: string }>
  }
  contact: {
    aria: string
    titleTop: string
    titleBottom: string
    body: string
    cta: string
  }
}

export const dictionaries: Record<Locale, HomeDictionary> = {
  en: {
    locale: 'en',
    direction: 'ltr',
    nav: {
      capabilities: 'Capabilities',
      proof: 'Proof',
      contact: 'Start a Project',
      switchLabel: 'عرض الموقع بالعربية',
      mobileStart: 'Start',
    },
    hero: {
      eyebrow: 'Nous — Digital Systems / Doha',
      headline: 'We make complex systems feel clear.',
      subtext: 'Strategy, software and intelligent products built by a senior Doha team—from first decision to live system.',
      primary: 'Bring Us the Hard Problem',
      secondary: 'See What Shipped',
      location: 'Doha · Qatar',
      signal: 'Live system',
      responsive: 'Ambient / Responsive',
      footer: ['Strategy', 'Intelligence', 'Software'],
      scroll: 'Scroll to explore',
    },
    about: {
      title: 'Why Nous',
      body: 'Complex work does not need to feel complicated. We bring strategy, design and engineering into one senior team, so decisions stay connected from the first conversation to the live system.',
      note: 'Based in Doha. Bilingual by design. Deliberately small, so the people shaping the work remain close to it from start to finish.',
    },
    capabilities: {
      label: '[ THE PROOF ]',
      title: 'What We Build',
      subtitle: 'Translating complex engineering into elegant, high-conversion business solutions.',
      business: 'Business View',
      engineering: 'Engineering View',
      explore: 'Tap a service to explore',
      openService: 'Open service page',
    },
    process: {
      title: 'Our DNA',
      subtitle: 'A straightforward process built for Gulf-market clients who value clarity and speed.',
      engagementTitle: 'Engagement Models',
      steps: [
        { label: 'Brief', heading: 'Tell us what you are building', body: 'Submit a project brief or reach us on WhatsApp. We ask the right questions upfront so there are no surprises later.' },
        { label: 'Scope', heading: 'We scope it together', body: 'Within 24 hours we send a clear proposal covering deliverables, timeline, and a fixed or milestone-based fee.' },
        { label: 'Build', heading: 'We design and engineer', body: 'Our senior team works in focused sprints with live staging previews. You see real progress, not status updates.' },
        { label: 'Launch', heading: 'We ship and support', body: 'We handle deployment, performance checks, and post-launch support so the product stays dependable.' },
      ],
      engagements: [
        { type: 'Fixed-scope project', description: 'Clear brief, agreed price, defined deliverables. Best for new products and redesigns.' },
        { type: 'Ongoing retainer', description: 'A dedicated monthly allocation for continuous development, design, and maintenance.' },
        { type: 'AI consultation', description: 'A focused engagement to assess AI readiness and architect a solution before build.' },
      ],
    },
    works: { label: '[ THE ART ]', title: 'Selected Work', empty: 'Projects coming soon' },
    testimonials: { title: 'Nous Circle', items: [] },
    faq: {
      label: 'Get to know us',
      title: 'Get to Know Us',
      items: [
        { q: 'What does Nous do?', a: 'Nous is a technology agency based in Doha, Qatar. We design and build AI systems, web applications, mobile apps, e-commerce platforms, and cloud infrastructure.' },
        { q: 'Where is Nous located?', a: 'We are based in Doha, Qatar, and work with clients across Qatar, the UAE, Saudi Arabia, and the broader GCC region.' },
        { q: 'What technologies does Nous build with?', a: 'We work with React, Next.js, Node.js, Python, Go, React Native, Swift, Flutter, Shopify, AWS, GCP, and leading AI frameworks.' },
        { q: 'How quickly does Nous respond?', a: 'We reply to all project inquiries within 24 hours. You can also reach us immediately through WhatsApp.' },
        { q: 'Does Nous build bilingual products?', a: 'Yes. We build bilingual Arabic and English products with native RTL support from the beginning.' },
      ],
    },
    contact: {
      aria: 'Start a project',
      titleTop: 'Have something',
      titleBottom: 'in mind?',
      body: "Tell us what you're building. We'll reply within 24 hours.",
      cta: 'Start Your Build',
    },
  },
  ar: {
    locale: 'ar',
    direction: 'rtl',
    nav: {
      capabilities: 'خدماتنا',
      proof: 'أعمالنا',
      contact: 'ابدأ مشروعك',
      switchLabel: 'View the site in English',
      mobileStart: 'ابدأ',
    },
    hero: {
      eyebrow: 'نوس — أنظمة رقمية / الدوحة',
      headline: 'نحوّل التعقيد إلى أنظمة واضحة.',
      subtext: 'استراتيجية وبرمجيات ومنتجات ذكية يبنيها فريق خبير في الدوحة — من القرار الأول حتى النظام العامل.',
      primary: 'اعرض علينا التحدّي',
      secondary: 'شاهد ما أنجزناه',
      location: 'الدوحة · قطر',
      signal: 'نظام حي',
      responsive: 'متفاعل / متجاوب',
      footer: ['استراتيجية', 'ذكاء', 'برمجيات'],
      scroll: 'مرّر للاستكشاف',
    },
    about: {
      title: 'لماذا نوس',
      body: 'العمل المعقّد لا يجب أن يبدو معقّداً. نجمع الاستراتيجية والتصميم والهندسة في فريق خبير واحد، لتبقى القرارات مترابطة من الحوار الأول حتى النظام العامل.',
      note: 'من الدوحة، وثنائي اللغة منذ التصميم. فريق صغير عن قصد، ليبقى من يصنع القرار قريباً من العمل حتى النهاية.',
    },
    capabilities: {
      label: '[ ما نبنيه ]',
      title: 'ما نبنيه',
      subtitle: 'نحوّل الهندسة المعقدة إلى حلول أعمال أنيقة، واضحة، ومصممة للنمو.',
      business: 'منظور الأعمال',
      engineering: 'المنظور التقني',
      explore: 'اضغط على الخدمة لاستكشافها',
      openService: 'افتح صفحة الخدمة',
    },
    process: {
      title: 'بصمتنا',
      subtitle: 'منهج واضح صُمم لعملاء الخليج الذين يقدّرون السرعة والوضوح.',
      engagementTitle: 'نماذج التعاون',
      steps: [
        { label: 'الفكرة', heading: 'أخبرنا عمّا تريد بناءه', body: 'أرسل موجز مشروعك أو تواصل معنا عبر واتساب. نطرح الأسئلة الصحيحة منذ البداية.' },
        { label: 'النطاق', heading: 'نحدّد النطاق معاً', body: 'خلال 24 ساعة نرسل عرضاً واضحاً يشمل المخرجات والجدول الزمني والتكلفة.' },
        { label: 'البناء', heading: 'نصمم ونطوّر', body: 'يعمل فريقنا الخبير ضمن مراحل مركّزة مع نسخ تجريبية حية تُظهر التقدم الحقيقي.' },
        { label: 'الإطلاق', heading: 'نطلق وندعم', body: 'نتولى النشر واختبارات الأداء ودعم ما بعد الإطلاق ليبقى المنتج موثوقاً.' },
      ],
      engagements: [
        { type: 'مشروع محدد النطاق', description: 'موجز واضح، تكلفة متفق عليها، ومخرجات محددة. مناسب للمنتجات الجديدة وإعادة التصميم.' },
        { type: 'تعاون مستمر', description: 'ساعات شهرية مخصصة للتطوير والتصميم والصيانة المستمرة.' },
        { type: 'استشارة ذكاء اصطناعي', description: 'تقييم مركز للجاهزية وبناء معمارية الحل قبل بدء التطوير.' },
      ],
    },
    works: { label: '[ أعمال مختارة ]', title: 'أعمال مختارة', empty: 'مشاريع جديدة قريباً' },
    testimonials: {
      title: 'دائرة نوس',
      items: [
        { quote: 'قدّمت نوس متجرنا على شوبيفاي خلال ستة أسابيع، وكانت تجربة العربية واتجاه RTL متقنة منذ اليوم الأول.', author: 'المؤسِّسة', role: 'ستيتشد', initials: 'س' },
        { quote: 'احتجنا منصة تعكس جودة تجربتنا في المتجر، وفهم فريق نوس ذلك فوراً. النتيجة موقع يكسب ثقة عملائنا.', author: 'المديرة', role: 'إيليت كولكشنز', initials: 'إ' },
        { quote: 'بنى فريق نوس نظام إدارة محتوى تبنّاه فريقنا غير التقني من اليوم الأول، ويعمل الموقع بسلاسة على الجوال.', author: 'المدير الإبداعي', role: 'الحاسة السابعة', initials: 'ح' },
      ],
    },
    faq: {
      label: 'تعرّف علينا',
      title: 'تعرّف على نوس',
      items: [
        { q: 'ماذا تقدم نوس؟', a: 'نوس وكالة تقنية في الدوحة تصمم وتبني أنظمة الذكاء الاصطناعي وتطبيقات الويب والجوال ومنصات التجارة الإلكترونية والبنية السحابية.' },
        { q: 'أين يقع مقر نوس؟', a: 'مقرنا في الدوحة، قطر، ونعمل مع عملاء في قطر والإمارات والسعودية ودول الخليج.' },
        { q: 'ما التقنيات التي تستخدمها نوس؟', a: 'نعمل مع React وNext.js وNode.js وPython وGo وتقنيات الجوال وشوبيفاي وAWS وGCP وأطر الذكاء الاصطناعي الحديثة.' },
        { q: 'متى ترد نوس على الاستفسارات؟', a: 'نرد على جميع استفسارات المشاريع خلال 24 ساعة، ويمكن التواصل معنا مباشرة عبر واتساب.' },
        { q: 'هل تبني نوس منتجات عربية وإنجليزية؟', a: 'نعم. نبني المنتجات ثنائية اللغة بدعم عربي أصيل واتجاه RTL منذ بداية التصميم.' },
      ],
    },
    contact: {
      aria: 'ابدأ مشروعاً',
      titleTop: 'لديك فكرة',
      titleBottom: 'تستحق البناء؟',
      body: 'أخبرنا عمّا تريد بناءه، وسنرد عليك خلال 24 ساعة.',
      cta: 'ابدأ مشروعك',
    },
  },
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}
