import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'

export const faqs = getDictionary('en').faq.items

interface AboutProps {
  locale?: Locale
  title?: string
  body?: string
  note?: string
}

export default function WhoWeAre({ locale = 'en', title, body, note }: AboutProps) {
  const dictionary = getDictionary(locale)
  const isAr = locale === 'ar'
  const evidence = isAr
    ? [
        { value: 'فريق واحد', label: 'استراتيجية وتصميم وهندسة' },
        { value: 'عربي / EN', label: 'ثنائي اللغة منذ البداية' },
        { value: 'قرار ← إطلاق', label: 'مسار متصل بلا فجوات' },
      ]
    : [
        { value: 'One team', label: 'Strategy, design and engineering' },
        { value: 'EN / عربي', label: 'Bilingual from the beginning' },
        { value: 'Decision → Live', label: 'One connected path' },
      ]

  return (
    <section id="about" aria-label={title ?? dictionary.about.title} lang={locale} dir={dictionary.direction} className="about-chapter">
      <div className="about-shell">
        <div className="about-trace" aria-hidden="true">
          <span>02</span>
          <i />
          <b>{isAr ? 'الأثر' : 'Trace'}</b>
        </div>

        <div className="about-layout">
          <div className="about-heading" data-reveal={isAr ? 'rtl' : 'copy'}>
            <span className="about-kicker">{isAr ? 'لماذا نوس' : 'Why Nous'}</span>
            <h2>{title ?? dictionary.about.title}</h2>
          </div>

          <div className="about-story" data-reveal={isAr ? 'rtl' : 'copy'}>
            <p className="about-lead">{body ?? dictionary.about.body}</p>
            <p className="about-note">{note ?? dictionary.about.note}</p>
          </div>
        </div>

        <div className="about-evidence" data-reveal-group>
          {evidence.map((item, index) => (
            <div className="about-evidence-item" data-reveal="grid" key={item.value}>
              <span>0{index + 1}</span>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .about-chapter {
          position: relative;
          z-index: 10;
          padding: clamp(92px, 11vw, 160px) clamp(24px, 5vw, 72px) clamp(84px, 10vw, 140px);
          color: var(--pine-800);
          background: var(--tea-100);
          overflow: hidden;
        }
        .about-shell { width: min(100%, 1480px); margin: 0 auto; }
        .about-trace {
          display: grid;
          grid-template-columns: auto minmax(80px, 1fr) auto;
          align-items: center;
          gap: 16px;
          margin-bottom: clamp(58px, 8vw, 106px);
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: rgba(6,59,43,.55);
        }
        .about-trace i { height: 1px; background: linear-gradient(90deg, var(--pine-700), rgba(8,71,52,.12)); }
        [dir="rtl"] .about-trace i { background: linear-gradient(270deg, var(--pine-700), rgba(8,71,52,.12)); }
        .about-trace b { color: var(--pine-700); font-weight: 700; }
        .about-layout { display: grid; grid-template-columns: minmax(280px,.7fr) minmax(420px,1.3fr); gap: clamp(54px, 10vw, 170px); align-items: start; }
        .about-kicker {
          display: block;
          margin-bottom: 18px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--pine-600);
        }
        [dir="rtl"] .about-kicker { font-family: var(--font-arabic); font-size: 13px; letter-spacing: 0; }
        .about-heading h2 {
          max-width: none;
          margin: 0;
          white-space: nowrap;
          font-family: var(--font-display);
          font-size: clamp(46px, 4.8vw, 72px);
          font-weight: 570;
          line-height: .9;
          letter-spacing: -.065em;
          color: var(--pine-800);
        }
        [dir="rtl"] .about-heading h2 { max-width: none; font-family: var(--font-display-ar); font-size: clamp(44px, 4.5vw, 68px); line-height: 1.08; letter-spacing: -.035em; }
        .about-story { padding-top: 32px; border-top: 1px solid rgba(8,71,52,.22); }
        .about-lead {
          max-width: 37ch;
          margin: 0;
          font-family: var(--font-body);
          font-size: clamp(25px, 2.7vw, 42px);
          font-weight: 490;
          line-height: 1.16;
          letter-spacing: -.035em;
          text-wrap: pretty;
          color: var(--pine-800);
        }
        [dir="rtl"] .about-lead { max-width: 34ch; font-family: var(--font-display-ar); font-size: clamp(24px, 2.5vw, 38px); line-height: 1.45; letter-spacing: -.02em; }
        .about-note {
          max-width: 60ch;
          margin: 30px 0 0;
          font-size: 16px;
          line-height: 1.65;
          color: rgba(6,59,43,.72);
        }
        [dir="rtl"] .about-note { font-family: var(--font-arabic); font-size: 17px; line-height: 1.9; }
        .about-evidence {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: clamp(72px, 10vw, 132px);
          border-top: 1px solid rgba(8,71,52,.24);
          border-bottom: 1px solid rgba(8,71,52,.24);
        }
        .about-evidence-item { min-height: 170px; padding: 22px 22px 24px 0; border-inline-end: 1px solid rgba(8,71,52,.18); display: flex; flex-direction: column; }
        [dir="rtl"] .about-evidence-item { padding: 22px 0 24px 22px; }
        .about-evidence-item:last-child { border-inline-end: 0; padding-inline-start: 22px; }
        .about-evidence-item:not(:first-child) { padding-inline-start: 22px; }
        .about-evidence-item > span { font-family: var(--font-mono); font-size: 9px; letter-spacing: .12em; color: rgba(8,71,52,.45); }
        .about-evidence-item strong { margin-top: auto; font-family: var(--font-display); font-size: clamp(23px, 2.2vw, 34px); font-weight: 570; letter-spacing: -.035em; }
        [dir="rtl"] .about-evidence-item strong { font-family: var(--font-display-ar); letter-spacing: -.02em; }
        .about-evidence-item p { margin: 7px 0 0; font-size: 14px; color: rgba(6,59,43,.65); }
        [dir="rtl"] .about-evidence-item p { font-family: var(--font-arabic); font-size: 15px; }

        @media (max-width: 780px) {
          .about-chapter { padding: 88px 20px 84px; }
          .about-trace { margin-bottom: 48px; }
          .about-layout { grid-template-columns: 1fr; gap: 44px; }
          .about-heading h2 { max-width: none; font-size: clamp(29px, 8vw, 42px); }
          [dir="rtl"] .about-heading h2 { max-width: none; font-size: clamp(28px, 7.6vw, 40px); }
          .about-story { padding-top: 24px; }
          .about-lead { font-size: clamp(24px, 7.4vw, 34px); line-height: 1.2; }
          [dir="rtl"] .about-lead { font-size: clamp(23px, 6.8vw, 32px); line-height: 1.5; }
          .about-note { margin-top: 22px; font-size: 16px; }
          .about-evidence { margin-top: 64px; }
          .about-evidence-item { min-height: 150px; padding-inline: 12px !important; }
          .about-evidence-item:first-child { padding-inline-start: 0 !important; }
          .about-evidence-item:last-child { padding-inline-end: 0 !important; }
          .about-evidence-item strong { font-size: 19px; }
          .about-evidence-item p { font-size: 12px; line-height: 1.45; }
        }

        @media (max-width: 430px) {
          .about-evidence { grid-template-columns: 1fr; }
          .about-evidence-item { min-height: 118px; padding: 18px 0 !important; border-inline-end: 0; border-bottom: 1px solid rgba(8,71,52,.16); }
          .about-evidence-item:last-child { border-bottom: 0; }
          .about-evidence-item strong { margin-top: 26px; }
        }
      `}</style>
    </section>
  )
}

interface FAQProps {
  locale?: Locale
  title?: string
  label?: string
  intro?: string
  items?: Array<{ q: string; a: string }>
}

export function FAQ({ locale = 'en', title, label, intro, items }: FAQProps) {
  const dictionary = getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <section id="faq" aria-label={title ?? dictionary.faq.title} lang={locale} dir={dictionary.direction} className="faq-chapter">
      <div className="faq-shell">
        <header className="faq-heading" data-reveal={isAr ? 'rtl' : 'copy'}>
          <span>{label ?? dictionary.faq.label}</span>
          <h2>{title ?? dictionary.faq.title}</h2>
          <p>{intro ?? (isAr ? 'إجابات مباشرة قبل أن نبدأ.' : 'Direct answers before we begin.')}</p>
        </header>

        <div className="faq-list">
          {(items ?? dictionary.faq.items).map((faq, index) => (
            <details className="faq-item" key={faq.q} open={index === 0}>
              <summary data-cursor="toggle">
                <span>0{index + 1}</span>
                <h3>{faq.q}</h3>
                <i aria-hidden="true" />
              </summary>
              <div className="faq-answer" itemScope itemType="https://schema.org/Answer">
                <p itemProp="text">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <style>{`
        .faq-chapter { position: relative; z-index: 10; padding: clamp(88px, 10vw, 144px) clamp(24px, 5vw, 72px); background: var(--tea-100); color: var(--pine-800); }
        .faq-shell { width: min(100%, 1480px); margin: 0 auto; display: grid; grid-template-columns: minmax(260px,.68fr) minmax(480px,1.32fr); gap: clamp(54px, 9vw, 150px); }
        .faq-heading > span { font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--pine-600); }
        .faq-heading h2 { max-width: none; margin: 14px 0 0; white-space: nowrap; font-family: var(--font-display); font-size: clamp(42px, 4.2vw, 64px); font-weight: 560; line-height: .95; letter-spacing: -.055em; }
        [dir="rtl"] .faq-heading h2 { font-family: var(--font-display-ar); line-height: 1.12; letter-spacing: -.03em; }
        .faq-heading p { margin: 24px 0 0; font-size: 16px; color: rgba(6,59,43,.64); }
        [dir="rtl"] .faq-heading p { font-family: var(--font-arabic); font-size: 17px; }
        .faq-list { border-top: 1px solid rgba(8,71,52,.22); }
        .faq-item { border-bottom: 1px solid rgba(8,71,52,.18); }
        .faq-item summary { min-height: 86px; display: grid; grid-template-columns: 34px 1fr 18px; align-items: center; gap: 16px; cursor: pointer; list-style: none; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary > span { font-family: var(--font-mono); font-size: 9px; color: rgba(8,71,52,.52); }
        .faq-item h3 { margin: 0; font-family: var(--font-body); font-size: clamp(18px, 1.55vw, 23px); font-weight: 520; letter-spacing: -.02em; color: var(--pine-800); }
        [dir="rtl"] .faq-item h3 { font-family: var(--font-display-ar); font-size: clamp(18px, 1.7vw, 25px); line-height: 1.5; }
        .faq-item summary i { position: relative; width: 14px; height: 14px; }
        .faq-item summary i::before, .faq-item summary i::after { content: ''; position: absolute; top: 6px; left: 0; width: 14px; height: 1px; background: var(--pine-700); transition: transform var(--motion-ui) var(--ease-out); }
        .faq-item summary i::after { transform: rotate(90deg); }
        .faq-item[open] summary i::after { transform: rotate(0); }
        .faq-answer { padding: 0 34px 28px 50px; }
        [dir="rtl"] .faq-answer { padding: 0 50px 28px 34px; }
        .faq-answer p { max-width: 65ch; margin: 0; font-size: 16px; line-height: 1.7; color: rgba(6,59,43,.66); }
        [dir="rtl"] .faq-answer p { font-family: var(--font-arabic); font-size: 16px; line-height: 1.9; }
        @media (max-width: 780px) {
          .faq-chapter { padding: 84px 20px; }
          .faq-shell { grid-template-columns: 1fr; gap: 52px; }
          .faq-heading h2 { font-size: clamp(29px, 8vw, 42px); }
          .faq-item summary { min-height: 78px; grid-template-columns: 28px 1fr 18px; gap: 10px; }
          .faq-item h3 { font-size: 18px; line-height: 1.4; }
          .faq-answer, [dir="rtl"] .faq-answer { padding: 0 0 24px 38px; }
          [dir="rtl"] .faq-answer { padding-left: 0; padding-right: 38px; }
        }
      `}</style>
    </section>
  )
}
