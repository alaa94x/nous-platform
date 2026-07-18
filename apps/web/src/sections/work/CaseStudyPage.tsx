import Link from 'next/link'
import Image from 'next/image'
import { serviceSlug } from '@/lib/service-slugs'
import type { CaseStudyProject } from '@/lib/case-studies'
import type { Locale } from '@/i18n/config'
import { ArrowUpRightIcon } from '@/components/icons/DirectionalIcons'

const COPY = {
  en: { back: 'Back to archive', visit: 'Visit live site', image: 'Project image — add through Projects', overview: 'Context', challenge: 'Constraint', solution: 'Intervention', services: 'Systems applied', tech: 'Working material', cta: 'Have a complex project in mind?', start: 'Start the Conversation', chapter: 'Nous Archive / Case Record' },
  ar: { back: 'العودة إلى الأرشيف', visit: 'زيارة الموقع', image: 'صورة المشروع — أضفها عبر المشاريع', overview: 'السياق', challenge: 'التحدّي', solution: 'التدخّل', services: 'الأنظمة المستخدمة', tech: 'مواد البناء', cta: 'لديك مشروع معقّد في ذهنك؟', start: 'ابدأ الحوار', chapter: 'أرشيف نوس / سجل المشروع' },
} as const

export default function CaseStudyPage({ project, locale = 'en' }: { project: CaseStudyProject; locale?: Locale }) {
  const isAr = locale === 'ar'
  const copy = COPY[locale]
  const name = isAr ? project.nameAr || project.name : project.name
  const tagline = isAr ? project.taglineAr : project.tagline
  const results = isAr ? project.resultsAr : project.results
  const services = isAr ? project.servicesAr : project.services
  const sections = [
    { index: '01', title: copy.overview, body: isAr ? project.overviewAr : project.overview },
    { index: '02', title: copy.challenge, body: isAr ? project.challengeAr : project.challenge },
    { index: '03', title: copy.solution, body: isAr ? project.solutionAr : project.solution },
  ]

  const linkedServices = services
    .map(service => ({ name: service, slug: serviceSlug(service) }))
    .filter((service): service is { name: string; slug: string } => Boolean(service.slug))

  return (
    <article className="case-page" lang={locale} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="case-shell">
        <div className="case-route-meta">
          <Link href={`${isAr ? '/ar' : ''}/#works`} className="pressable">{isAr ? '→' : '←'} {copy.back}</Link>
          <i />
          <span>{copy.chapter}</span>
        </div>

        <header className="case-hero">
          <div className="case-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}<span>{project.year}</span></div>
          <h1>{name}</h1>
          {!isAr && project.nameAr && <p className="case-ar-name" lang="ar" dir="rtl">{project.nameAr}</p>}
          <div className="case-intro">
            <p>{tagline}</p>
            {project.externalUrl && <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="pressable"><span>{copy.visit}</span><ArrowUpRightIcon size={18} /></a>}
          </div>
        </header>

        <div className="case-media">
          {project.imageUrl ? <Image src={project.imageUrl} alt={`${name}, project screenshot`} fill priority sizes="(max-width: 820px) 100vw, 90vw" /> : <div><i /><i /><i /><span>{copy.image}</span></div>}
          <span>NOUS / ARCHIVE</span>
        </div>

        {results.length > 0 && <section className="case-results" aria-label="Project outcomes">
          {results.map((result, index) => <div key={`${result.metric}-${index}`}><span>0{index + 1}</span><strong>{result.value}</strong><h2>{result.metric}</h2><p>{result.note}</p></div>)}
        </section>}

        <div className="case-narrative">
          {sections.map(section => <section key={section.index}><header><span>{section.index}</span><h2>{section.title}</h2></header><p>{section.body}</p></section>)}
        </div>

        <section className="case-system-map">
          <div><span>04</span><h2>{copy.services}</h2></div>
          <div className="case-system-links">
            {linkedServices.map(service => <Link key={service.slug} href={`${isAr ? '/ar' : ''}/services/${service.slug}`} className="pressable"><span>{service.name}</span><ArrowUpRightIcon size={18} /></Link>)}
          </div>
          <div className="case-tech"><span>{copy.tech}</span><div>{project.tech.map(item => <i key={item}>{item}</i>)}</div></div>
        </section>

        <section className="case-next">
          <p>{copy.cta}</p>
          <Link href={isAr ? '/ar/contact' : '/contact'} className="pressable"><span>{copy.start}</span><ArrowUpRightIcon size={18} /></Link>
        </section>
      </div>

      <style>{`
        .case-page{min-height:100dvh;padding:124px clamp(24px,5vw,72px) 104px;background:var(--ink-900);color:var(--paper-100)}.case-shell{width:min(100%,1480px);margin:0 auto}.case-route-meta{display:grid;grid-template-columns:auto minmax(60px,1fr) auto;align-items:center;gap:16px;font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(242,245,236,.45)}.case-route-meta a{min-height:44px;display:inline-flex;align-items:center;color:var(--lime-300)}.case-route-meta i{height:1px;background:rgba(205,237,179,.18)}
        .case-hero{padding:clamp(72px,9vw,128px) 0 clamp(68px,8vw,112px)}.case-tags{display:flex;flex-wrap:wrap;gap:8px}.case-tags span{padding:6px 10px;border:1px solid rgba(205,237,179,.19);font-family:var(--font-mono);font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--tea-100)}.case-tags span:last-child{color:var(--lime-300)}.case-hero h1{max-width:12ch;margin:28px 0 0;font-family:var(--font-display);font-size:clamp(72px,9vw,144px);font-weight:570;line-height:.86;letter-spacing:-.075em;text-wrap:balance}.case-ar-name{margin:22px 0 0;font-family:var(--font-display-ar);font-size:clamp(28px,3vw,44px);color:var(--tea-100);text-align:left}.case-intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,.38fr);align-items:end;gap:clamp(52px,9vw,145px);margin-top:clamp(46px,6vw,84px);padding-top:28px;border-top:1px solid rgba(205,237,179,.18)}.case-intro>p{max-width:36ch;margin:0;font-family:var(--font-display);font-size:clamp(25px,2.8vw,44px);line-height:1.18;letter-spacing:-.04em;color:var(--tea-100)}.case-intro>a,.case-next>a{min-height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:var(--lime-300);color:var(--ink-950);font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.case-intro b,.case-next b{font-size:19px}[dir="rtl"] .case-hero h1,[dir="rtl"] .case-intro>p{font-family:var(--font-display-ar);letter-spacing:-.025em;line-height:1.25}[dir="rtl"] .case-intro>a,[dir="rtl"] .case-next>a{font-family:var(--font-arabic);font-size:14px;letter-spacing:0;text-transform:none}
        .case-media{position:relative;min-height:clamp(400px,62vw,880px);overflow:hidden;background:#0b211a;border:1px solid rgba(205,237,179,.16)}.case-media>img{object-fit:cover}.case-media>div{position:absolute;inset:0;display:grid;place-items:center;background-image:linear-gradient(rgba(205,237,179,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(205,237,179,.07) 1px,transparent 1px);background-size:64px 64px}.case-media>div i{position:absolute;width:48%;aspect-ratio:1;border:1px solid rgba(206,241,123,.16);border-radius:50%}.case-media>div i:nth-child(2){width:32%}.case-media>div i:nth-child(3){width:17%;border-color:rgba(206,241,123,.36)}.case-media>div span{z-index:1;font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--lime-300)}.case-media>span{position:absolute;z-index:2;right:18px;bottom:16px;font-family:var(--font-mono);font-size:8px;letter-spacing:.12em;color:rgba(242,245,236,.52)}[dir="rtl"] .case-media>span{right:auto;left:18px}
        .case-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));border-bottom:1px solid rgba(205,237,179,.17)}.case-results>div{min-height:250px;padding:26px 24px;border-inline-end:1px solid rgba(205,237,179,.14);display:flex;flex-direction:column}.case-results>div:last-child{border:0}.case-results>div>span{font-family:var(--font-mono);font-size:8px;color:rgba(206,241,123,.48)}.case-results strong{margin:auto 0 12px;font-family:var(--font-display);font-size:clamp(42px,5vw,76px);font-weight:560;line-height:1;letter-spacing:-.055em}.case-results h2{margin:0;font-size:15px;font-weight:600}.case-results p{margin:6px 0 0;font-size:12px;color:rgba(242,245,236,.48)}[dir="rtl"] .case-results strong,[dir="rtl"] .case-results h2,[dir="rtl"] .case-results p{font-family:var(--font-arabic)}
        .case-narrative>section{display:grid;grid-template-columns:minmax(220px,.5fr) minmax(0,1.5fr);gap:clamp(50px,10vw,170px);padding:clamp(78px,9vw,126px) 0;border-bottom:1px solid rgba(205,237,179,.17)}.case-narrative header>span,.case-system-map>div:first-child>span{font-family:var(--font-mono);font-size:9px;color:var(--lime-300)}.case-narrative h2,.case-system-map h2{max-width:9ch;margin:16px 0 0;font-family:var(--font-display);font-size:clamp(40px,4.8vw,72px);font-weight:550;line-height:.98;letter-spacing:-.055em}.case-narrative section>p{max-width:58ch;margin:24px 0 0;font-size:clamp(19px,1.9vw,27px);line-height:1.55;color:rgba(242,245,236,.7);white-space:pre-line}[dir="rtl"] .case-narrative h2,[dir="rtl"] .case-system-map h2{font-family:var(--font-display-ar);line-height:1.35;letter-spacing:-.02em}[dir="rtl"] .case-narrative section>p{font-family:var(--font-arabic);line-height:1.9}
        .case-system-map{display:grid;grid-template-columns:minmax(220px,.5fr) minmax(0,1fr) minmax(220px,.5fr);gap:clamp(35px,6vw,90px);padding:clamp(78px,9vw,126px) 0;border-bottom:1px solid rgba(205,237,179,.17)}.case-system-links{border-top:1px solid rgba(205,237,179,.17)}.case-system-links a{min-height:62px;display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid rgba(205,237,179,.14);font-size:16px;color:var(--paper-100)}.case-system-links b{color:var(--lime-300)}.case-tech>span{font-family:var(--font-mono);font-size:8px;letter-spacing:.13em;text-transform:uppercase;color:rgba(242,245,236,.48)}.case-tech>div{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}.case-tech i{padding:7px 10px;border:1px solid rgba(205,237,179,.16);font-family:var(--font-mono);font-size:8px;font-style:normal;color:var(--tea-100)}
        .case-next{display:grid;grid-template-columns:1fr minmax(280px,.5fr);align-items:center;gap:50px;padding:clamp(82px,10vw,140px) 0 0}.case-next p{margin:0;font-family:var(--font-display);font-size:clamp(38px,5vw,76px);font-weight:550;line-height:.98;letter-spacing:-.055em}[dir="rtl"] .case-next p{font-family:var(--font-display-ar);line-height:1.35;letter-spacing:-.02em}
        @media(max-width:820px){.case-page{padding:104px 20px 112px}.case-route-meta{grid-template-columns:auto 1fr}.case-route-meta>span{display:none}.case-hero{padding:64px 0 74px}.case-hero h1{font-size:clamp(58px,17vw,82px)}.case-intro{grid-template-columns:1fr;gap:42px}.case-media{min-height:360px}.case-results{grid-template-columns:1fr 1fr}.case-results>div{min-height:190px}.case-narrative>section,.case-system-map{grid-template-columns:1fr;gap:42px}.case-system-map{gap:54px}.case-next{grid-template-columns:1fr;gap:44px}.case-next a{width:100%}}@media(max-width:430px){.case-results{grid-template-columns:1fr}.case-results>div{min-height:170px;border-inline-end:0;border-bottom:1px solid rgba(205,237,179,.14)}}
      `}</style>
    </article>
  )
}
