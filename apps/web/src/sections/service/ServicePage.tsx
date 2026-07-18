// Server component — all service content is available without JavaScript.
import Link from 'next/link'
import type { Locale } from '@/i18n/config'
import { ArrowUpRightIcon } from '@/components/icons/DirectionalIcons'

export interface ServicePageData {
  name: string
  nameAr: string
  slug: string
  tagline: string
  description: string
  whatWeDeliver: string[]
  techStack: string[]
  useCases: Array<{ title: string; body: string }>
  faq: Array<{ q: string; a: string }>
}

const COPY = {
  en: { back: 'All systems', chapter: 'Nous Instrument / Lens', deliver: 'What the system delivers', useCases: 'Where it creates value', tech: 'Working material', faq: 'Questions before we build', ready: 'Have a difficult system to shape?', start: 'Bring Us the Problem', input: 'Business need', output: 'Working system' },
  ar: { back: 'كل الأنظمة', chapter: 'أداة نوس / العدسة', deliver: 'ما الذي يقدمه النظام', useCases: 'أين يصنع القيمة', tech: 'مواد البناء', faq: 'أسئلة قبل أن نبني', ready: 'لديك نظام معقّد يحتاج إلى تشكيل؟', start: 'اعرض علينا التحدّي', input: 'حاجة العمل', output: 'نظام عامل' },
} as const

export default function ServicePage({ service, locale = 'en' }: { service: ServicePageData; locale?: Locale }) {
  const isAr = locale === 'ar'
  const copy = COPY[locale]
  const name = isAr ? service.nameAr || service.name : service.name

  return (
    <article className="service-page" lang={locale} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="service-shell">
        <div className="service-route-meta">
          <Link href={`${isAr ? '/ar' : ''}/#capabilities`} className="pressable">{isAr ? '→' : '←'} {copy.back}</Link>
          <i />
          <span>{copy.chapter}</span>
        </div>

        <header className="service-hero">
          <div className="service-hero-copy">
            <span>System / {service.slug.replaceAll('-', ' ')}</span>
            <h1>{name}</h1>
            {!isAr && service.nameAr && <p className="service-ar-name" lang="ar" dir="rtl">{service.nameAr}</p>}
            <p className="service-tagline">{service.tagline}</p>
            <p className="service-description">{service.description}</p>
          </div>
          <div className="service-lens" aria-hidden="true">
            <div className="service-lens-head"><span>{copy.input}</span><span>{copy.output}</span></div>
            <div className="service-lens-stage"><i /><i /><i /><b /><span>01</span></div>
            <div className="service-lens-foot"><span>{service.whatWeDeliver.length.toString().padStart(2, '0')} outputs</span><span>{service.techStack.length.toString().padStart(2, '0')} tools</span></div>
          </div>
        </header>

        <section className="service-deliver" aria-labelledby="service-deliver-title">
          <header><span>01</span><h2 id="service-deliver-title">{copy.deliver}</h2></header>
          <ol>{service.whatWeDeliver.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></li>)}</ol>
        </section>

        <section className="service-cases" aria-labelledby="service-cases-title">
          <header><span>02</span><h2 id="service-cases-title">{copy.useCases}</h2></header>
          <div>{service.useCases.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
        </section>

        <section className="service-material" aria-labelledby="service-material-title">
          <header><span>03</span><h2 id="service-material-title">{copy.tech}</h2></header>
          <div>{service.techStack.map(item => <span key={item}>{item}</span>)}</div>
        </section>

        <section className="service-faq" aria-labelledby="service-faq-title">
          <header><span>04</span><h2 id="service-faq-title">{copy.faq}</h2></header>
          <div>{service.faq.map((item, index) => <details key={item.q} open={index === 0}><summary><span>0{index + 1}</span><h3>{item.q}</h3><i /></summary><p>{item.a}</p></details>)}</div>
        </section>

        <section className="service-next">
          <p>{copy.ready}</p>
          <Link href={isAr ? '/ar/contact' : '/contact'} className="pressable"><span>{copy.start}</span><ArrowUpRightIcon size={18} /></Link>
        </section>
      </div>

      <style>{`
        .service-page{min-height:100dvh;padding:124px clamp(24px,5vw,72px) 100px;background:var(--ink-900);color:var(--paper-100)}
        .service-shell{width:min(100%,1480px);margin:0 auto}.service-route-meta{display:grid;grid-template-columns:auto minmax(60px,1fr) auto;align-items:center;gap:16px;font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(242,245,236,.45)}.service-route-meta a{min-height:44px;display:inline-flex;align-items:center;color:var(--lime-300)}.service-route-meta i{height:1px;background:rgba(205,237,179,.18)}
        .service-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.75fr);align-items:end;gap:clamp(60px,10vw,170px);padding:clamp(76px,9vw,132px) 0 clamp(88px,11vw,160px)}.service-hero-copy>span,.service-deliver header>span,.service-cases header>span,.service-material header>span,.service-faq header>span{font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--lime-300)}.service-hero h1{max-width:10ch;margin:18px 0 0;font-family:var(--font-display);font-size:clamp(64px,8vw,126px);font-weight:570;line-height:.88;letter-spacing:-.07em;text-wrap:balance}.service-ar-name{margin:22px 0 0;font-family:var(--font-display-ar);font-size:clamp(25px,3vw,42px);color:var(--tea-100);text-align:left}.service-tagline{max-width:38ch;margin:34px 0 0;font-family:var(--font-display);font-size:clamp(24px,2.4vw,36px);line-height:1.2;letter-spacing:-.035em;color:var(--tea-100)}.service-description{max-width:62ch;margin:22px 0 0;font-size:16px;line-height:1.7;color:rgba(242,245,236,.58)}
        [dir="rtl"] .service-hero h1,[dir="rtl"] .service-tagline{font-family:var(--font-display-ar);letter-spacing:-.025em;line-height:1.25}[dir="rtl"] .service-description{font-family:var(--font-arabic);font-size:17px;line-height:1.9}
        .service-lens{border:1px solid rgba(205,237,179,.18);background:rgba(8,71,52,.22)}.service-lens-head,.service-lens-foot{display:flex;justify-content:space-between;gap:16px;padding:14px 16px;font-family:var(--font-mono);font-size:8px;letter-spacing:.11em;text-transform:uppercase;color:rgba(242,245,236,.48)}.service-lens-head{border-bottom:1px solid rgba(205,237,179,.14)}.service-lens-foot{border-top:1px solid rgba(205,237,179,.14)}.service-lens-stage{position:relative;aspect-ratio:1;overflow:hidden}.service-lens-stage i{position:absolute;border:1px solid rgba(206,241,123,.18);border-radius:50%;inset:12%}.service-lens-stage i:nth-child(2){inset:25%}.service-lens-stage i:nth-child(3){inset:39%;border-color:rgba(206,241,123,.42)}.service-lens-stage b{position:absolute;inset:48%;border-radius:50%;background:var(--lime-300);box-shadow:0 0 35px rgba(206,241,123,.5)}.service-lens-stage span{position:absolute;inset:auto 16px 14px auto;font-family:var(--font-mono);font-size:9px;color:var(--lime-300)}
        .service-deliver,.service-cases,.service-material,.service-faq{display:grid;grid-template-columns:minmax(210px,.45fr) minmax(0,1.55fr);gap:clamp(44px,8vw,130px);padding:clamp(70px,8vw,110px) 0;border-top:1px solid rgba(205,237,179,.17)}.service-deliver h2,.service-cases h2,.service-material h2,.service-faq h2{max-width:11ch;margin:16px 0 0;font-family:var(--font-display);font-size:clamp(34px,4vw,62px);font-weight:550;line-height:1;letter-spacing:-.05em}[dir="rtl"] .service-deliver h2,[dir="rtl"] .service-cases h2,[dir="rtl"] .service-material h2,[dir="rtl"] .service-faq h2{font-family:var(--font-display-ar);line-height:1.35;letter-spacing:-.02em}
        .service-deliver ol{margin:0;padding:0;list-style:none;border-top:1px solid rgba(205,237,179,.17)}.service-deliver li{display:grid;grid-template-columns:38px 1fr;gap:18px;min-height:74px;align-items:center;border-bottom:1px solid rgba(205,237,179,.14)}.service-deliver li>span{font-family:var(--font-mono);font-size:8px;color:rgba(206,241,123,.48)}.service-deliver li p{margin:0;font-size:18px;color:var(--paper-100)}[dir="rtl"] .service-deliver li p{font-family:var(--font-arabic)}
        .service-cases>div{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid rgba(205,237,179,.17);border-bottom:1px solid rgba(205,237,179,.17)}.service-cases article{min-height:310px;padding:24px;border-inline-end:1px solid rgba(205,237,179,.14);display:flex;flex-direction:column}.service-cases article:last-child{border:0}.service-cases article>span{font-family:var(--font-mono);font-size:8px;color:rgba(206,241,123,.48)}.service-cases h3{margin:auto 0 16px;font-family:var(--font-display);font-size:clamp(24px,2.2vw,34px);font-weight:550;line-height:1.08;letter-spacing:-.04em}.service-cases p{margin:0;font-size:14px;line-height:1.65;color:rgba(242,245,236,.56)}[dir="rtl"] .service-cases h3{font-family:var(--font-display-ar);line-height:1.45}[dir="rtl"] .service-cases p{font-family:var(--font-arabic);font-size:15px;line-height:1.85}
        .service-material>div{display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start}.service-material>div span{padding:10px 14px;border:1px solid rgba(205,237,179,.2);font-family:var(--font-mono);font-size:9px;letter-spacing:.08em;color:var(--tea-100)}
        .service-faq>div{border-top:1px solid rgba(205,237,179,.17)}.service-faq details{border-bottom:1px solid rgba(205,237,179,.14)}.service-faq summary{min-height:80px;display:grid;grid-template-columns:32px 1fr 16px;align-items:center;gap:14px;cursor:pointer;list-style:none}.service-faq summary::-webkit-details-marker{display:none}.service-faq summary>span{font-family:var(--font-mono);font-size:8px;color:rgba(206,241,123,.48)}.service-faq h3{margin:0;font-size:19px;font-weight:520;letter-spacing:-.02em}.service-faq summary i{position:relative;width:14px;height:14px}.service-faq summary i:before,.service-faq summary i:after{content:'';position:absolute;top:7px;width:14px;height:1px;background:var(--lime-300)}.service-faq summary i:after{transform:rotate(90deg);transition:transform var(--motion-ui) var(--ease-out)}.service-faq details[open] summary i:after{transform:none}.service-faq details>p{max-width:65ch;margin:0;padding:0 32px 26px 46px;font-size:15px;line-height:1.75;color:rgba(242,245,236,.58)}[dir="rtl"] .service-faq h3,[dir="rtl"] .service-faq details>p{font-family:var(--font-arabic)}[dir="rtl"] .service-faq details>p{padding:0 46px 26px 32px;line-height:1.9}
        .service-next{padding:clamp(76px,9vw,122px) 0 0;border-top:1px solid rgba(205,237,179,.17);display:grid;grid-template-columns:1fr minmax(280px,.6fr);align-items:center;gap:40px}.service-next p{margin:0;font-family:var(--font-display);font-size:clamp(34px,4.5vw,70px);font-weight:550;line-height:1;letter-spacing:-.05em}.service-next a{min-height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;background:var(--lime-300);color:var(--ink-950);font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:.11em;text-transform:uppercase}.service-next b{font-size:20px}[dir="rtl"] .service-next p{font-family:var(--font-display-ar);line-height:1.35;letter-spacing:-.02em}[dir="rtl"] .service-next a{font-family:var(--font-arabic);font-size:14px;letter-spacing:0;text-transform:none}
        @media(max-width:820px){.service-page{padding:104px 20px 110px}.service-route-meta{grid-template-columns:auto 1fr}.service-route-meta span{display:none}.service-hero{grid-template-columns:1fr;gap:56px;padding:66px 0 88px}.service-hero h1{font-size:clamp(54px,16vw,78px)}.service-lens{width:min(100%,440px)}.service-deliver,.service-cases,.service-material,.service-faq{grid-template-columns:1fr;gap:42px;padding:74px 0}.service-cases>div{grid-template-columns:1fr}.service-cases article{min-height:220px;border-inline-end:0;border-bottom:1px solid rgba(205,237,179,.14)}.service-next{grid-template-columns:1fr;gap:44px}.service-next a{width:100%}}
      `}</style>
    </article>
  )
}
