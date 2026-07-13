import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'

interface Testimonial {
  quote: string
  quote_ar?: string | null
  author: string
  author_ar?: string | null
  role: string | null
  role_ar?: string | null
  initials: string | null
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  locale?: Locale
  title?: string
  label?: string
}

export default function Testimonials({ testimonials, locale = 'en', title, label }: TestimonialsProps) {
  const dictionary = getDictionary(locale)
  const isAr = locale === 'ar'
  const localizedItems = testimonials.map(item => isAr ? {
    ...item,
    quote: item.quote_ar || item.quote,
    author: item.author_ar || item.author,
    role: item.role_ar || item.role,
  } : item)
  const items = localizedItems.length ? localizedItems : dictionary.testimonials.items
  if (items.length === 0) return null

  return (
    <section id="testimonials" aria-label={title ?? dictionary.testimonials.title} lang={locale} dir={dictionary.direction} className="pulse-chapter">
      <div className="pulse-shell">
        <header className="pulse-heading" data-reveal={isAr ? 'rtl' : 'copy'}>
          <div className="pulse-meta"><span>06</span><i /><span>{isAr ? 'النبض' : 'Pulse'}</span></div>
          <div className="pulse-title"><span>{label ?? (isAr ? 'ما اختبره عملاؤنا' : 'What clients experienced')}</span><h2>{title ?? dictionary.testimonials.title}</h2></div>
        </header>

        <div className="pulse-grid" data-reveal-group>
          {items.map((item, index) => (
            <blockquote className={`pulse-quote${index === 0 ? ' pulse-quote--lead' : ''}`} data-reveal="grid" key={`${item.author}-${index}`}>
              <div className="pulse-wave" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <span className="pulse-index">0{index + 1}</span>
              <p>{item.quote}</p>
              <footer>
                <span>{item.initials || item.author.slice(0, 1)}</span>
                <div><cite>{item.author}</cite>{item.role && <small>{item.role}</small>}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>

      <style>{`
        .pulse-chapter { position: relative; z-index: 10; padding: clamp(92px,11vw,158px) clamp(24px,5vw,72px); color: var(--pine-800); background: var(--tea-100); }
        .pulse-shell { width: min(100%,1480px); margin: 0 auto; }
        .pulse-meta { display: grid; grid-template-columns: auto minmax(80px,1fr) auto; align-items: center; gap: 16px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(6,59,43,.45); }
        .pulse-meta i { height: 1px; background: rgba(8,71,52,.2); }.pulse-meta span:last-child { color: var(--pine-700); }
        .pulse-title { margin-top: clamp(30px,4vw,54px); }
        .pulse-title > span { display:block; margin-bottom:16px; font-family:var(--font-mono); font-size:9px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--pine-600); }
        .pulse-heading h2 { max-width:none; margin:0; white-space:nowrap; font-family:var(--font-display); font-size:clamp(46px,4.8vw,72px); font-weight:560; line-height:.94; letter-spacing:-.06em; }
        [dir="rtl"] .pulse-heading h2 { font-family:var(--font-display-ar); line-height:1.08; letter-spacing:-.035em; }
        .pulse-grid { display:grid; grid-template-columns:1.35fr .65fr; margin-top:clamp(70px,9vw,126px); border-top:1px solid rgba(8,71,52,.23); border-bottom:1px solid rgba(8,71,52,.23); }
        .pulse-quote { position:relative; min-height:260px; margin:0; padding:28px 28px 30px; border-inline-start:1px solid rgba(8,71,52,.18); display:flex; flex-direction:column; overflow:hidden; }
        .pulse-quote--lead { grid-row:span 2; min-height:520px; border-inline-start:0; padding-inline-start:0; padding-inline-end:clamp(28px,5vw,72px); }
        [dir="rtl"] .pulse-quote--lead { padding-inline-start:clamp(28px,5vw,72px); padding-inline-end:0; }
        .pulse-quote:not(.pulse-quote--lead)+.pulse-quote { border-top:1px solid rgba(8,71,52,.18); }
        .pulse-wave { height:34px; display:flex; align-items:center; gap:5px; margin-bottom:clamp(30px,5vw,64px); }
        .pulse-wave::before,.pulse-wave::after { content:''; flex:1; height:1px; background:rgba(8,71,52,.18); }
        .pulse-wave i { width:3px; height:8px; background:var(--pine-600); animation:pulse-wave 2.8s ease-in-out infinite; }.pulse-wave i:nth-child(2){animation-delay:.14s}.pulse-wave i:nth-child(3){height:20px;animation-delay:.28s}.pulse-wave i:nth-child(4){animation-delay:.42s}.pulse-wave i:nth-child(5){animation-delay:.56s}
        .pulse-index { font-family:var(--font-mono); font-size:9px; color:rgba(8,71,52,.45); }
        .pulse-quote > p { max-width:34ch; margin:24px 0 34px; font-family:var(--font-display); font-size:clamp(23px,2.4vw,38px); font-weight:520; line-height:1.22; letter-spacing:-.035em; color:var(--pine-800); text-wrap:pretty; }
        .pulse-quote--lead > p { max-width:28ch; font-size:clamp(32px,3.7vw,58px); line-height:1.08; }
        [dir="rtl"] .pulse-quote > p { font-family:var(--font-display-ar); line-height:1.55; letter-spacing:-.02em; }
        .pulse-quote footer { display:flex; align-items:center; gap:12px; margin-top:auto; }
        .pulse-quote footer>span { width:38px; height:38px; display:grid; place-items:center; border:1px solid rgba(8,71,52,.3); font-family:var(--font-display); font-weight:600; color:var(--pine-700); }
        .pulse-quote cite { display:block; font-family:var(--font-mono); font-size:9px; font-weight:700; letter-spacing:.08em; font-style:normal; text-transform:uppercase; }
        .pulse-quote small { display:block; margin-top:4px; font-size:12px; color:rgba(6,59,43,.58); }
        [dir="rtl"] .pulse-quote cite,[dir="rtl"] .pulse-quote small { font-family:var(--font-arabic); text-transform:none; }
        @keyframes pulse-wave { 0%,100%{transform:scaleY(.5);opacity:.45}50%{transform:scaleY(1.6);opacity:1} }
        @media (max-width:780px){
          .pulse-chapter{padding:88px 20px}.pulse-heading h2{font-size:clamp(29px,8vw,42px)}.pulse-grid{display:flex;flex-direction:column}.pulse-quote,.pulse-quote--lead{min-height:0;padding:28px 0 36px;border-inline-start:0;border-top:1px solid rgba(8,71,52,.18)}.pulse-quote--lead{border-top:0}.pulse-wave{margin-bottom:30px}.pulse-quote>p,.pulse-quote--lead>p{font-size:clamp(25px,7vw,34px);line-height:1.18}.pulse-quote footer{margin-top:34px}
        }
        @media (prefers-reduced-motion:reduce){.pulse-wave i{animation:none}}
      `}</style>
    </section>
  )
}
