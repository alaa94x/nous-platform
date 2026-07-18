import Image from 'next/image'
import Link from 'next/link'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'
import { ArrowUpRightIcon } from '@/components/icons/DirectionalIcons'

interface Project {
  id: string
  name: string
  name_ar?: string | null
  description: string | null
  description_ar?: string | null
  year: string | null
  tags: string[] | null
  image_url: string | null
  url?: string | null
  slug?: string | null
  is_case_study?: boolean | null
}

interface WorksProps {
  projects: Project[]
  locale?: Locale
  label?: string
  title?: string
  intro?: string
}

function ProjectArchiveCard({ project, index, locale }: { project: Project; index: number; locale: Locale }) {
  const isAr = locale === 'ar'
  const name = isAr ? project.name_ar || project.name : project.name
  const description = isAr ? project.description_ar || project.description : project.description
  const internal = project.is_case_study && project.slug ? `${isAr ? '/ar' : ''}/work/${project.slug}` : null
  const href = internal || project.url
  const content = (
    <article className={`archive-card archive-card--${index === 0 ? 'featured' : 'standard'}`}>
      <div className="archive-media">
        {project.image_url ? (
          <Image src={project.image_url} alt="" fill priority={index === 0} sizes={index === 0 ? '(max-width: 900px) 100vw, 60vw' : '(max-width: 900px) 100vw, 40vw'} style={{ objectFit: 'cover' }} />
        ) : (
          <div className="archive-placeholder" aria-hidden="true"><i /><i /><i /><span>{String(index + 1).padStart(2, '0')}</span></div>
        )}
        <div className="archive-scrim" />
      </div>
      <div className="archive-meta">
        <span>{project.year || '—'}</span>
        <span>NOUS / {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="archive-copy">
        <div className="archive-tags">{(project.tags ?? []).slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div>
        <h3>{name}</h3>
        {description && <p>{description}</p>}
      </div>
      {href && <span className="archive-open" aria-hidden="true"><ArrowUpRightIcon size={16} /></span>}
      <div className="archive-trace" aria-hidden="true" />
    </article>
  )

  if (!href) return content
  if (internal) return <Link href={internal} className="archive-link">{content}</Link>
  return <a href={href} className="archive-link" target="_blank" rel="noopener noreferrer">{content}</a>
}

export default function Works({ projects, locale = 'en', label, title, intro }: WorksProps) {
  const dictionary = getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <section id="works" aria-label={title ?? dictionary.works.title} lang={locale} dir={dictionary.direction} className="works-chapter">
      <div className="works-shell">
        <header className="works-heading" data-reveal={isAr ? 'rtl' : 'copy'}>
          <div className="works-heading-meta"><span>05</span><i /><span>{isAr ? 'الأرشيف' : 'Archive'}</span></div>
          <div className="works-heading-copy">
            <div><span>{label ?? dictionary.works.label}</span><h2>{title ?? dictionary.works.title}</h2></div>
            <p>{intro ?? (isAr ? 'مشاريع حقيقية، تُعرض من خلال التحدّي والتدخّل والنتيجة.' : 'Real work, shown through the challenge, the intervention and the outcome.')}</p>
          </div>
        </header>

        {projects.length === 0 ? (
          <div className="archive-empty"><span>00</span><p>{dictionary.works.empty}</p></div>
        ) : (
          <div className="archive-grid" data-reveal-group>
            {projects.map((project, index) => <ProjectArchiveCard project={project} index={index} locale={locale} key={project.id} />)}
          </div>
        )}
      </div>

      <style>{`
        .works-chapter { position: relative; z-index: 10; padding: clamp(92px,11vw,158px) clamp(24px,5vw,72px); color: var(--pine-800); background: var(--tea-100); }
        .works-shell { width: min(100%,1480px); margin: 0 auto; }
        .works-heading-meta { display: grid; grid-template-columns: auto minmax(80px,1fr) auto; align-items: center; gap: 16px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--light-micro); }
        .works-heading-meta i { height: 1px; background: rgba(8,71,52,.2); }
        .works-heading-meta span:last-child { color: var(--pine-700); }
        .works-heading-copy { display: grid; grid-template-columns: minmax(0,1fr) minmax(300px,.65fr); align-items: end; gap: clamp(42px,7vw,112px); margin-top: clamp(30px,4vw,54px); }
        .works-heading-copy > div > span { display: block; margin-bottom: 16px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--pine-600); }
        .works-heading h2 { margin: 0; white-space: nowrap; font-family: var(--font-display); font-size: clamp(46px,4.8vw,72px); font-weight: 560; line-height: .94; letter-spacing: -.06em; }
        [dir="rtl"] .works-heading h2 { font-family: var(--font-display-ar); line-height: 1.08; letter-spacing: -.035em; }
        .works-heading-copy > p { max-width: 48ch; margin: 0 0 8px; font-size: 17px; line-height: 1.65; color: var(--light-muted); }
        [dir="rtl"] .works-heading-copy > p { font-family: var(--font-arabic); font-size: 18px; line-height: 1.85; }
        .archive-grid { display: grid; grid-template-columns: repeat(12,1fr); grid-auto-flow: dense; gap: 16px; margin-top: clamp(70px,9vw,126px); }
        .archive-link { display: block; min-width: 0; color: inherit; }
        .archive-link:nth-child(1) { grid-column: span 7; grid-row: span 2; }
        .archive-link:nth-child(2), .archive-link:nth-child(3) { grid-column: span 5; }
        .archive-link:nth-child(n+4) { grid-column: span 4; }
        .archive-card { position: relative; min-height: 302px; height: 100%; overflow: hidden; color: var(--paper-100); border: 1px solid rgba(8,71,52,.22); background: #0c1a16; }
        .archive-card--featured { min-height: 620px; }
        .archive-media, .archive-scrim { position: absolute; inset: 0; }
        .archive-media img { filter: saturate(.8) brightness(.72); transition: transform 900ms var(--ease-out), filter 500ms ease; }
        .archive-scrim { background: linear-gradient(180deg, rgba(7,17,14,.2), rgba(7,17,14,.08) 35%, rgba(7,17,14,.92) 100%); }
        .archive-placeholder { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(135deg, var(--pine-800), var(--ink-950)); }
        .archive-placeholder::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(205,237,179,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(205,237,179,.08) 1px,transparent 1px); background-size: 48px 48px; }
        .archive-placeholder i { position: absolute; width: 45%; aspect-ratio: 1; border: 1px solid rgba(206,241,123,.16); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%,-50%); }
        .archive-placeholder i:nth-child(2) { width: 31%; }.archive-placeholder i:nth-child(3) { width: 17%; border-color: rgba(206,241,123,.34); }
        .archive-placeholder span { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-family: var(--font-mono); color: var(--lime-300); }
        .archive-meta { position: absolute; z-index: 2; top: 18px; left: 18px; right: 18px; display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 8px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(242,245,236,.58); }
        .archive-copy { position: absolute; z-index: 2; left: 22px; right: 58px; bottom: 22px; }
        .archive-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .archive-tags span { font-family: var(--font-mono); font-size: 7px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--lime-300); }
        .archive-copy h3 { margin: 0; font-family: var(--font-display); font-size: clamp(25px,2.5vw,42px); font-weight: 560; line-height: 1; letter-spacing: -.045em; }
        [dir="rtl"] .archive-copy h3 { font-family: var(--font-display-ar); line-height: 1.35; letter-spacing: -.02em; }
        .archive-card--standard .archive-copy h3 { font-size: clamp(22px,1.9vw,31px); }
        .archive-copy p { max-width: 54ch; margin: 10px 0 0; font-size: 14px; line-height: 1.55; color: rgba(242,245,236,.62); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        [dir="rtl"] .archive-copy p { font-family: var(--font-arabic); font-size: 15px; line-height: 1.75; }
          .archive-open { position: absolute; z-index: 3; right: 18px; bottom: 20px; width: 34px; height: 34px; display: grid; place-items: center; color: var(--lime-300); }
        [dir="rtl"] .archive-open { right: auto; left: 18px; }
        .archive-trace { position: absolute; z-index: 3; left: 0; bottom: 0; width: 0; height: 3px; background: var(--lime-300); transition: width 700ms var(--ease-out); }
        [dir="rtl"] .archive-trace { left: auto; right: 0; }
        @media (hover:hover) and (pointer:fine) { .archive-link:hover .archive-media img { transform: scale(1.035); filter: saturate(1) brightness(.82); }.archive-link:hover .archive-trace { width: 100%; } }
        .archive-empty { margin-top: 72px; min-height: 300px; display: grid; place-items: center; border: 1px dashed rgba(8,71,52,.22); text-align: center; }
        .archive-empty span { font-family: var(--font-mono); color: var(--pine-700); }.archive-empty p { font-size: 17px; color: var(--light-muted); }
        @media (max-width: 900px) {
          .works-chapter { padding: 88px 20px; }
          .works-heading-copy { grid-template-columns: 1fr; gap: 34px; }
          .works-heading h2 { font-size: clamp(29px,8vw,42px); }
          .archive-grid { display: flex; flex-direction: column; gap: 14px; margin-top: 70px; }
          .archive-link { width: 100%; }
          .archive-card, .archive-card--featured { min-height: 280px; }
          .archive-link:not(:first-child) .archive-card { min-height: 240px; }
          .archive-copy { left: 18px; bottom: 18px; }
          .archive-copy h3, .archive-card--standard .archive-copy h3 { font-size: 28px; }
          .archive-copy p { display:none; }
        }
      `}</style>
    </section>
  )
}
