import Nav from '@/components/nav/Nav'
import DocumentLocale from '@/components/language/DocumentLocale'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import { SectionBoundary } from '@/components/SectionBoundary'
import Hero from '@/sections/hero/Hero'
import Capabilities from '@/sections/capabilities/Capabilities'
import Works from '@/sections/works/Works'
import WhoWeAre, { FAQ } from '@/sections/about/About'
import Testimonials from '@/sections/testimonials/Testimonials'
import HowWeWork from '@/sections/howwework/HowWeWork'
import ContactCTA from '@/sections/contact/ContactCTA'
import Footer, { DEFAULT_CONTACT_ITEMS, DEFAULT_SOCIAL_ITEMS } from '@/sections/footer/Footer'
import type { ContactItem, SocialItem } from '@/sections/footer/Footer'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'
import type { HomePageData } from '@/lib/home-data'
import MotionObserver from '@/components/motion/MotionObserver'
import type { FieldMotionMode } from '@/sections/hero/AssemblyField'

interface HomeExperienceProps {
  locale: Locale
  data: HomePageData
}

export default function HomeExperience({ locale, data }: HomeExperienceProps) {
  const { settings: s, services, projects, testimonials } = data
  const dictionary = getDictionary(locale)
  const localizedSetting = (base: string, fallback: string) =>
    s[`${base}_${locale}`] || s[base] || fallback
  const requestedMotion = s['hero_motion_mode']
  const motionMode: FieldMotionMode = requestedMotion === 'calm' || requestedMotion === 'off'
    ? requestedMotion
    : 'standard'
  const revealPhrases: [string, string, string] = [
    localizedSetting('hero_reveal_1', locale === 'ar' ? 'نجد الإشارة.' : 'Find the signal.'),
    localizedSetting('hero_reveal_2', locale === 'ar' ? 'نصوغ النظام.' : 'Shape the system.'),
    localizedSetting('hero_reveal_3', locale === 'ar' ? 'نطلقه للحياة.' : 'Make it live.'),
  ]
  const faqItems = dictionary.faq.items.map((item, index) => ({
    q: localizedSetting(`faq_${index + 1}_question`, item.q),
    a: localizedSetting(`faq_${index + 1}_answer`, item.a),
  }))

  let contactItems: ContactItem[] = DEFAULT_CONTACT_ITEMS
  let socialItems: SocialItem[] = DEFAULT_SOCIAL_ITEMS
  try {
    if (s['footer_contact_items']) contactItems = JSON.parse(s['footer_contact_items'])
    if (s['footer_social_items']) socialItems = JSON.parse(s['footer_social_items'])
  } catch {
    // Invalid admin JSON should never take down the public homepage.
  }
  const whatsappHref = contactItems.find(item => item.enabled && item.icon === 'whatsapp')?.href
    ?? 'https://wa.me/97477484004'
  const secondarySetting = localizedSetting('hero_cta_secondary', dictionary.hero.secondary)
  const secondaryCta = ['See What Shipped', 'View Selected Works', 'شاهد ما أنجزناه'].includes(secondarySetting)
    ? (locale === 'ar' ? 'تحدث معنا عبر واتساب' : 'Talk to us on WhatsApp')
    : secondarySetting

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: faqItems.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <div lang={locale} dir={dictionary.direction}>
      <DocumentLocale locale={locale} />
      <MotionObserver />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Cursor />
      <Noise />
      <Nav siteName={s['site_name']} locale={locale} showLanguageSwitch />
      <main id="main-content">
        <SectionBoundary name="hero">
          <Hero
            eyebrow={localizedSetting('hero_eyebrow', dictionary.hero.eyebrow)}
            headlineEn={localizedSetting('hero_headline', dictionary.hero.headline)}
            headlineAr={localizedSetting('hero_headline', dictionary.hero.headline)}
            subtextEn={localizedSetting('hero_subtext', dictionary.hero.subtext)}
            subtextAr={localizedSetting('hero_subtext', dictionary.hero.subtext)}
            ctaPrimary={localizedSetting('hero_cta_primary', dictionary.hero.primary)}
            ctaSecondary={secondaryCta}
            whatsappHref={whatsappHref}
            location={localizedSetting('hero_location', dictionary.hero.location)}
            revealPhrases={revealPhrases}
            revealHint={localizedSetting('hero_reveal_hint', locale === 'ar' ? 'المس المجال لاكتشاف الإشارة' : 'Move through the field to reveal the signal')}
            motionMode={motionMode}
            locale={locale}
          />
        </SectionBoundary>
        <div className="home-tone-bridge" aria-hidden="true">
          <i /><i /><span>02</span>
        </div>
        <div className="home-light-canvas">
          <SectionBoundary name="about"><WhoWeAre locale={locale} title={localizedSetting('about_title', dictionary.about.title)} body={localizedSetting('about_body', dictionary.about.body)} note={localizedSetting('about_note', dictionary.about.note)} /></SectionBoundary>
          <SectionBoundary name="capabilities"><Capabilities services={services} locale={locale} label={localizedSetting('capabilities_label', dictionary.capabilities.label)} title={localizedSetting('capabilities_title', dictionary.capabilities.title)} subtitle={localizedSetting('capabilities_subtitle', dictionary.capabilities.subtitle)} /></SectionBoundary>
          <SectionBoundary name="how-we-work"><HowWeWork locale={locale} title={localizedSetting('process_title', dictionary.process.title)} subtitle={localizedSetting('process_subtitle', dictionary.process.subtitle)} engagementTitle={localizedSetting('process_engagement_title', dictionary.process.engagementTitle)} engagementIntro={localizedSetting('process_engagement_intro', locale === 'ar' ? 'نختار شكل التعاون بحسب ما يحتاجه النظام، لا بحسب قالب جاهز.' : 'The engagement shape follows what the system needs—not a preset package.')} /></SectionBoundary>
          <SectionBoundary name="works"><Works projects={projects} locale={locale} label={localizedSetting('works_label', dictionary.works.label)} title={localizedSetting('works_title', dictionary.works.title)} intro={localizedSetting('works_intro', locale === 'ar' ? 'مشاريع حقيقية، تُعرض من خلال التحدّي والتدخّل والنتيجة.' : 'Real work, shown through the challenge, the intervention and the outcome.')} /></SectionBoundary>
          <SectionBoundary name="testimonials"><Testimonials testimonials={testimonials} locale={locale} label={localizedSetting('testimonials_label', locale === 'ar' ? 'ما اختبره عملاؤنا' : 'What clients experienced')} title={localizedSetting('testimonials_title', dictionary.testimonials.title)} /></SectionBoundary>
          <SectionBoundary name="faq"><FAQ locale={locale} label={localizedSetting('faq_label', dictionary.faq.label)} title={localizedSetting('faq_title', dictionary.faq.title)} intro={localizedSetting('faq_intro', locale === 'ar' ? 'إجابات مباشرة قبل أن نبدأ.' : 'Direct answers before we begin.')} items={faqItems} /></SectionBoundary>
          <SectionBoundary name="contact"><ContactCTA contactEmail={s['contact_email']} locale={locale} title={localizedSetting('contact_title', `${dictionary.contact.titleTop} ${dictionary.contact.titleBottom}`)} support={localizedSetting('contact_support', dictionary.contact.body)} cta={localizedSetting('contact_cta', dictionary.contact.cta)} responseNote={localizedSetting('contact_response_note', locale === 'ar' ? 'نرد خلال ٢٤ ساعة' : 'Reply within 24 hours')} /></SectionBoundary>
        </div>
      </main>
      <Footer
        siteName={s['site_name']}
        companyName={s['company_name'] ?? 'Nous'}
        contactItems={contactItems}
        socialItems={socialItems}
        footerCopyright={s['footer_copyright'] || undefined}
        locale={locale}
      />
    </div>
  )
}
