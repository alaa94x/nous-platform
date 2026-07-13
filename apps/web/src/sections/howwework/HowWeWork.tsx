// Server component: content remains complete without JavaScript or animation.
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'

interface HowWeWorkProps {
  locale?: Locale
  title?: string
  subtitle?: string
  engagementTitle?: string
  engagementIntro?: string
}

export default function HowWeWork({ locale = 'en', title, subtitle, engagementTitle, engagementIntro }: HowWeWorkProps) {
  const dictionary = getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <section id="how-we-work" aria-label={title ?? dictionary.process.title} lang={locale} dir={dictionary.direction} className="process-chapter">
      <div className="process-shell">
        <header className="process-heading" data-reveal={isAr ? 'rtl' : 'copy'}>
          <div className="process-heading-meta"><span>04</span><i /><span>{isAr ? 'التجميع' : 'Assembly'}</span></div>
          <div className="process-heading-copy">
            <h2>{title ?? dictionary.process.title}</h2>
            <p>{subtitle ?? dictionary.process.subtitle}</p>
          </div>
        </header>

        <ol className="process-path" data-reveal-group>
          {dictionary.process.steps.map((step, index) => (
            <li className="process-node" data-reveal="grid" key={step.label}>
              <div className="process-node-signal"><span>0{index + 1}</span><i /></div>
              <span className="process-node-label">{step.label}</span>
              <h3>{step.heading}</h3>
              <p>{step.body}</p>
              <b aria-hidden="true">{index === dictionary.process.steps.length - 1 ? '●' : '→'}</b>
            </li>
          ))}
        </ol>

        <div className="engagements">
          <div className="engagements-intro">
            <span>{engagementTitle ?? dictionary.process.engagementTitle}</span>
            <p>{engagementIntro ?? (isAr ? 'نختار شكل التعاون بحسب ما يحتاجه النظام، لا بحسب قالب جاهز.' : 'The engagement shape follows what the system needs—not a preset package.')}</p>
          </div>
          <div className="engagements-list">
            {dictionary.process.engagements.map((engagement, index) => (
              <div key={engagement.type}>
                <span>0{index + 1}</span>
                <strong>{engagement.type}</strong>
                <p>{engagement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .process-chapter { position: relative; z-index: 10; padding: clamp(92px, 11vw, 158px) clamp(24px, 5vw, 72px); color: var(--pine-800); background: var(--tea-100); overflow: hidden; }
        .process-shell { width: min(100%, 1480px); margin: 0 auto; }
        .process-heading-meta { display: grid; grid-template-columns: auto minmax(80px,1fr) auto; align-items: center; gap: 16px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(6,59,43,.48); }
        .process-heading-meta i { height: 1px; background: rgba(8,71,52,.2); }
        .process-heading-meta span:last-child { color: var(--pine-700); }
        .process-heading-copy { display: grid; grid-template-columns: minmax(0,1fr) minmax(300px,.65fr); align-items: end; gap: clamp(42px, 7vw, 112px); margin-top: clamp(30px, 4vw, 54px); }
        .process-heading h2 { max-width: none; margin: 0; white-space: nowrap; font-family: var(--font-display); font-size: clamp(46px, 4.8vw, 72px); font-weight: 560; line-height: .94; letter-spacing: -.06em; color: var(--pine-800); }
        [dir="rtl"] .process-heading h2 { font-family: var(--font-display-ar); line-height: 1.08; letter-spacing: -.035em; }
        .process-heading-copy p { max-width: 48ch; margin: 0 0 8px; font-size: 17px; line-height: 1.65; color: rgba(6,59,43,.68); }
        [dir="rtl"] .process-heading-copy p { font-family: var(--font-arabic); font-size: 18px; line-height: 1.85; }
        .process-path { position: relative; display: grid; grid-template-columns: repeat(4,1fr); gap: 0; margin: clamp(76px, 10vw, 138px) 0 0; padding: 0; list-style: none; border-top: 1px solid rgba(8,71,52,.25); border-bottom: 1px solid rgba(8,71,52,.25); }
        .process-path::before { content: ''; position: absolute; top: -1px; left: 0; width: 25%; height: 2px; background: var(--pine-700); animation: process-trace 7s var(--ease-in-out) infinite; }
        [dir="rtl"] .process-path::before { left: auto; right: 0; animation-name: process-trace-rtl; }
        .process-node { position: relative; min-height: 380px; padding: 24px 24px 30px; border-inline-end: 1px solid rgba(8,71,52,.18); display: flex; flex-direction: column; }
        .process-node:last-child { border-inline-end: 0; }
        .process-node-signal { display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 9px; color: rgba(8,71,52,.45); }
        .process-node-signal i { width: 7px; height: 7px; border: 1px solid var(--pine-700); border-radius: 50%; }
        .process-node-label { margin-top: clamp(50px, 6vw, 82px); font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--pine-600); }
        [dir="rtl"] .process-node-label { font-family: var(--font-arabic); font-size: 13px; letter-spacing: 0; }
        .process-node h3 { margin: 16px 0 0; font-family: var(--font-display); font-size: clamp(23px, 2.1vw, 34px); font-weight: 560; line-height: 1.08; letter-spacing: -.04em; color: var(--pine-800); }
        [dir="rtl"] .process-node h3 { font-family: var(--font-display-ar); line-height: 1.45; letter-spacing: -.02em; }
        .process-node p { margin: 18px 0 0; font-size: 15px; line-height: 1.65; color: rgba(6,59,43,.67); }
        [dir="rtl"] .process-node p { font-family: var(--font-arabic); font-size: 16px; line-height: 1.85; }
        .process-node > b { margin-top: auto; align-self: flex-end; font-family: var(--font-mono); font-size: 18px; font-weight: 400; color: var(--pine-600); }
        [dir="rtl"] .process-node > b { transform: scaleX(-1); }
        .engagements { display: grid; grid-template-columns: minmax(250px,.7fr) minmax(480px,1.3fr); gap: clamp(50px, 9vw, 150px); margin-top: clamp(72px, 9vw, 120px); }
        .engagements-intro > span { font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--pine-600); }
        .engagements-intro p { max-width: 34ch; margin: 20px 0 0; font-family: var(--font-display); font-size: clamp(23px,2.2vw,34px); font-weight: 540; line-height: 1.2; letter-spacing: -.035em; }
        [dir="rtl"] .engagements-intro p { font-family: var(--font-display-ar); line-height: 1.5; letter-spacing: -.02em; }
        .engagements-list { border-top: 1px solid rgba(8,71,52,.23); }
        .engagements-list > div { display: grid; grid-template-columns: 32px minmax(150px,.7fr) 1fr; gap: 18px; padding: 24px 0; border-bottom: 1px solid rgba(8,71,52,.19); }
        .engagements-list span { font-family: var(--font-mono); font-size: 9px; color: rgba(8,71,52,.45); }
        .engagements-list strong { font-family: var(--font-display); font-size: 20px; font-weight: 560; letter-spacing: -.03em; }
        [dir="rtl"] .engagements-list strong { font-family: var(--font-display-ar); }
        .engagements-list p { margin: 0; font-size: 14px; line-height: 1.6; color: rgba(6,59,43,.65); }
        [dir="rtl"] .engagements-list p { font-family: var(--font-arabic); font-size: 15px; line-height: 1.8; }
        @keyframes process-trace { 0%,12% { transform: translateX(0); } 88%,100% { transform: translateX(300%); } }
        @keyframes process-trace-rtl { 0%,12% { transform: translateX(0); } 88%,100% { transform: translateX(-300%); } }

        @media (max-width: 900px) {
          .process-chapter { padding: 88px 20px; }
          .process-heading-copy { grid-template-columns: 1fr; gap: 34px; }
          .process-heading h2 { font-size: clamp(29px,8vw,42px); }
          .process-path { grid-template-columns: 1fr; margin-top: 74px; border-bottom: 0; border-inline-start: 1px solid rgba(8,71,52,.25); }
          .process-path::before { top: 0; left: -1px; width: 2px; height: 25%; animation: process-trace-mobile 7s var(--ease-in-out) infinite; }
          [dir="rtl"] .process-path { border-inline-start: 1px solid rgba(8,71,52,.25); }
          [dir="rtl"] .process-path::before { right: -1px; left: auto; animation: process-trace-mobile 7s var(--ease-in-out) infinite; }
          .process-node { min-height: 0; padding: 24px 20px 42px; border-inline-end: 0; border-bottom: 1px solid rgba(8,71,52,.18); }
          .process-node-label { margin-top: 32px; }
          .process-node h3 { font-size: 27px; }
          .process-node p { max-width: 54ch; font-size: 16px; }
          .process-node > b { margin-top: 28px; }
          .engagements { grid-template-columns: 1fr; gap: 48px; }
          .engagements-list > div { grid-template-columns: 28px 1fr; gap: 10px; }
          .engagements-list p { grid-column: 2; font-size: 15px; }
          @keyframes process-trace-mobile { 0%,12% { transform: translateY(0); } 88%,100% { transform: translateY(300%); } }
        }
        @media (prefers-reduced-motion: reduce) { .process-path::before { animation: none; } }
      `}</style>
    </section>
  )
}
