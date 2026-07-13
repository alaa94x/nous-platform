import Link from 'next/link'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'

interface ContactCTAProps {
  contactEmail?: string
  locale?: Locale
  title?: string
  support?: string
  cta?: string
  responseNote?: string
}

export default function ContactCTA({ contactEmail = 'nouslab@icould.com', locale = 'en', title, support, cta, responseNote }: ContactCTAProps) {
  const dictionary = getDictionary(locale)
  const isAr = locale === 'ar'
  const heading = title ?? `${dictionary.contact.titleTop} ${dictionary.contact.titleBottom}`

  return (
    <section id="contact" aria-label={dictionary.contact.aria} lang={locale} dir={dictionary.direction} className="convergence">
      <div className="convergence-field" aria-hidden="true"><i /><i /><i /><b /><span /></div>
      <div className="convergence-shell">
        <div className="convergence-meta"><span>08</span><i /><span>{isAr ? 'التلاقي' : 'Convergence'}</span></div>
        <div className="convergence-layout">
          <div className="convergence-copy" data-reveal={isAr ? 'rtl' : 'copy'}>
            <span>{isAr ? 'المسألة الصعبة هي البداية' : 'The hard problem is the starting point'}</span>
            <h2>{heading}</h2>
            <p>{support ?? dictionary.contact.body}</p>
          </div>
          <div className="convergence-action" data-reveal="copy">
            <Link href={isAr ? '/ar/contact' : '/contact'} className="convergence-link pressable">
              <span>{cta ?? dictionary.contact.cta}</span><i aria-hidden="true">↗</i>
            </Link>
            <div>
              <span>{responseNote ?? (isAr ? 'نرد خلال ٢٤ ساعة' : 'Reply within 24 hours')}</span>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .convergence { position:relative; z-index:10; min-height:680px; padding:clamp(84px,10vw,140px) clamp(24px,5vw,72px); overflow:hidden; color:var(--ink-950); background:var(--lime-300); }
        .convergence-shell{position:relative;z-index:2;width:min(100%,1480px);margin:0 auto}.convergence-meta{display:grid;grid-template-columns:auto minmax(80px,1fr) auto;align-items:center;gap:16px;font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(7,17,14,.52)}.convergence-meta i{height:1px;background:rgba(7,17,14,.24)}
        .convergence-layout{display:grid;grid-template-columns:1.2fr .8fr;align-items:end;gap:clamp(54px,10vw,170px);margin-top:clamp(100px,13vw,190px)}.convergence-copy>span{font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}.convergence-copy h2{max-width:10ch;margin:18px 0 0;font-family:var(--font-display);font-size:clamp(68px,8.5vw,138px);font-weight:580;line-height:.88;letter-spacing:-.07em;text-wrap:balance}.convergence-copy p{max-width:44ch;margin:28px 0 0;font-size:18px;line-height:1.55;color:rgba(7,17,14,.68)}
        [dir="rtl"] .convergence-copy>span,[dir="rtl"] .convergence-copy p{font-family:var(--font-arabic)}[dir="rtl"] .convergence-copy h2{font-family:var(--font-display-ar);font-size:clamp(58px,7.5vw,118px);line-height:1.1;letter-spacing:-.035em}
        .convergence-action{padding-bottom:8px}.convergence-link{min-height:70px;width:100%;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:0 24px;background:var(--ink-950);color:var(--paper-100);font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;transition:transform var(--motion-fast) var(--ease-out),background var(--motion-ui) ease}.convergence-link:hover{background:var(--pine-800)}.convergence-link i{font-style:normal;font-size:22px}.convergence-action>div{display:flex;justify-content:space-between;gap:18px;margin-top:14px;font-family:var(--font-mono);font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(7,17,14,.58)}.convergence-action>div a{display:inline-flex;min-height:44px;align-items:center}
        [dir="rtl"] .convergence-link,[dir="rtl"] .convergence-action>div{font-family:var(--font-arabic);font-size:13px;letter-spacing:0;text-transform:none}
        .convergence-field{position:absolute;inset:0;pointer-events:none}.convergence-field i{position:absolute;border:1px solid rgba(7,17,14,.13);border-radius:50%;width:clamp(260px,38vw,620px);aspect-ratio:1;right:-6%;top:4%}.convergence-field i:nth-child(2){right:15%;top:24%;width:clamp(180px,27vw,440px)}.convergence-field i:nth-child(3){right:38%;top:8%;width:clamp(130px,19vw,310px)}[dir="rtl"] .convergence-field i{right:auto;left:-6%}[dir="rtl"] .convergence-field i:nth-child(2){left:15%}[dir="rtl"] .convergence-field i:nth-child(3){left:38%}.convergence-field b,.convergence-field span{position:absolute;width:10px;height:10px;border-radius:50%;background:var(--ink-950);box-shadow:0 0 0 12px rgba(7,17,14,.08);right:32%;top:42%;animation:convergence-pulse 3.5s ease-in-out infinite}.convergence-field span{right:48%;top:29%;animation-delay:1.2s}[dir="rtl"] .convergence-field b{right:auto;left:32%}[dir="rtl"] .convergence-field span{right:auto;left:48%}@keyframes convergence-pulse{50%{transform:scale(1.6);box-shadow:0 0 0 22px rgba(7,17,14,0)}}
        @media(max-width:780px){.convergence{min-height:650px;padding:84px 20px 112px}.convergence-layout{grid-template-columns:1fr;gap:54px;margin-top:100px}.convergence-copy h2{font-size:clamp(56px,16vw,78px);line-height:.92}.convergence-copy p{font-size:17px}.convergence-link{min-height:62px}.convergence-action>div{flex-direction:column;gap:7px}.convergence-field{opacity:.65}}
        @media(prefers-reduced-motion:reduce){.convergence-field b,.convergence-field span{animation:none}}
      `}</style>
    </section>
  )
}
