'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { SERVICE_PAGE_SLUGS } from '@/lib/service-slugs'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'

type ViewMode = 'business' | 'engineering'

interface Service {
  id: string
  idx: string | null
  name: string
  name_ar?: string | null
  name_tech?: string | null
  name_tech_ar?: string | null
  category: string | null
  tech_pills?: string[] | null
  business_pills?: string[] | null
  business_tags?: string[] | null
  engineering_tags?: string[] | null
  business_outcomes?: string[] | null
  engineering_stack?: string[] | null
  business_subtext?: string | null
  business_subtext_ar?: string | null
}

interface CapabilitiesProps {
  services: Service[]
  locale?: Locale
  label?: string
  title?: string
  subtitle?: string
}

function serviceName(service: Service, view: ViewMode, locale: Locale) {
  if (locale === 'ar') {
    return view === 'engineering'
      ? service.name_tech_ar || service.name_ar || service.name_tech || service.name
      : service.name_ar || service.name
  }
  return view === 'engineering' ? service.name_tech || service.name : service.name
}

function serviceOutcomes(service: Service, view: ViewMode) {
  return view === 'engineering'
    ? service.engineering_stack ?? service.tech_pills ?? []
    : service.business_outcomes ?? service.business_pills ?? []
}

function serviceTags(service: Service, view: ViewMode) {
  if (view === 'engineering') return service.engineering_tags?.length ? service.engineering_tags : service.category?.split(' · ') ?? []
  return service.business_tags ?? []
}

function serviceSlug(service: Service) {
  return SERVICE_PAGE_SLUGS[service.name] ?? (service.name_tech ? SERVICE_PAGE_SLUGS[service.name_tech] : undefined)
}

function LensInstrument({ service, view, locale, services }: { service: Service | undefined; view: ViewMode; locale: Locale; services: Service[] }) {
  const outcomes = service ? serviceOutcomes(service, view).slice(0, 4) : []
  const name = service ? serviceName(service, view, locale) : ''
  const isAr = locale === 'ar'
  const sceneRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  const moveScene = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return
    const scene = sceneRef.current
    if (!scene) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      scene.style.transform = `perspective(900px) rotateX(${(-y * 3.2).toFixed(2)}deg) rotateY(${(x * 4.2).toFixed(2)}deg) translateZ(0)`
    })
  }

  const resetScene = () => {
    const scene = sceneRef.current
    if (!scene) return
    cancelAnimationFrame(frameRef.current)
    scene.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)'
  }

  const nodeLabels = outcomes.length
    ? outcomes
    : services.slice(0, 4).map(item => serviceName(item, view, locale))

  return (
    <div className="lens" aria-hidden="true" onPointerMove={moveScene} onPointerLeave={resetScene}>
      <div className="lens-head">
        <span className="lens-head__label"><i />{isAr ? 'مرصد القدرات' : 'Capability Observatory'}</span>
        <span>{view === 'business' ? (isAr ? 'منظور الأثر' : 'Impact mode') : (isAr ? 'منظور البنية' : 'Architecture mode')}</span>
      </div>

      <div className="lens-stage">
        <div className="lens-aurora lens-aurora--one" />
        <div className="lens-aurora lens-aurora--two" />
        <div className="lens-vignette" />
        <div className="lens-axis lens-axis--x" />
        <div className="lens-axis lens-axis--y" />

        <div className="lens-scene" ref={sceneRef}>
          <div className="lens-floor"><i /><i /><i /></div>
          <div className="lens-halo lens-halo--outer" />
          <div className="lens-halo lens-halo--inner" />
          <div className="lens-orbit lens-orbit--one"><i /></div>
          <div className="lens-orbit lens-orbit--two"><i /></div>
          <div className="lens-orbit lens-orbit--three"><i /></div>

          <div className="lens-orb">
            <span className="lens-orb__surface" />
            <span className="lens-orb__latitude lens-orb__latitude--one" />
            <span className="lens-orb__latitude lens-orb__latitude--two" />
            <span className="lens-orb__shine" />
            <b>{service?.idx ?? '00'}</b>
          </div>

          <div className="lens-micro-orbs"><i /><i /><i /></div>
        </div>

        <div className="lens-nodes">
          {nodeLabels.map((outcome, index) => (
            <span key={`${outcome}-${index}`}>
              <i>0{index + 1}</i><b>{outcome}</b><em />
            </span>
          ))}
        </div>

        <div className="lens-selected">
          <span>{isAr ? 'النظام النشط' : 'Active system'} · {service?.idx ?? '00'}</span>
          <strong>{name || (isAr ? 'اختر نظاماً' : 'Select a system')}</strong>
        </div>
      </div>

      <div className="lens-foot">
        <span>{isAr ? 'مدخل / تعقيد' : 'Input / complexity'}</span>
        <i><b /></i>
        <span>{isAr ? 'مخرج / وضوح' : 'Output / clarity'}</span>
      </div>
    </div>
  )
}

function MobileOrb({ index }: { index: string }) {
  return (
    <div className="cap-mobile-orb" aria-hidden="true">
      <i className="cap-mobile-orb__ring cap-mobile-orb__ring--one" />
      <i className="cap-mobile-orb__ring cap-mobile-orb__ring--two" />
      <span><b>{index}</b></span>
    </div>
  )
}

export default function Capabilities({ services, locale = 'en', label, title, subtitle }: CapabilitiesProps) {
  const reduced = !!useReducedMotion()
  const chapterRef = useRef<HTMLElement>(null)
  const dictionary = getDictionary(locale)
  const isAr = locale === 'ar'
  const [view, setView] = useState<ViewMode>('business')
  const [activeId, setActiveId] = useState<string | null>(services[0]?.id ?? null)
  const [openId, setOpenId] = useState<string | null>(services[0]?.id ?? null)
  const mobileSelectorRef = useRef<HTMLDivElement>(null)
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const active = services.find(service => service.id === activeId) ?? services[0]
  const activeName = active ? serviceName(active, view, locale) : ''
  const activeOutcomes = active ? serviceOutcomes(active, view) : []
  const activeTags = active ? serviceTags(active, view).slice(0, 3) : []
  const activeSlug = active ? serviceSlug(active) : undefined
  const activeDescription = active
    ? (isAr ? active.business_subtext_ar : active.business_subtext)
    : null

  const selectService = (service: Service) => {
    setActiveId(service.id)
    setOpenId(service.id)
  }

  const stepService = (direction: 1 | -1) => {
    if (!active || services.length < 2) return
    const index = services.findIndex(service => service.id === active.id)
    const next = (index + direction + services.length) % services.length
    const service = services[next]
    if (service) selectService(service)
  }

  const beginSwipe = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') return
    swipeStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const endSwipe = (event: React.PointerEvent<HTMLElement>) => {
    const start = swipeStartRef.current
    swipeStartRef.current = null
    if (!start) return
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaX) < 46 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return
    stepService(deltaX < 0 ? 1 : -1)
  }

  useEffect(() => {
    const selector = mobileSelectorRef.current
    if (!selector || !activeId) return
    const selected = Array.from(selector.querySelectorAll<HTMLButtonElement>('button'))
      .find(button => button.dataset['serviceId'] === activeId)
    if (!selected) return
    const selectorBounds = selector.getBoundingClientRect()
    const selectedBounds = selected.getBoundingClientRect()
    const horizontalDelta = selectedBounds.left + selectedBounds.width / 2
      - (selectorBounds.left + selectorBounds.width / 2)
    selector.scrollBy({ left: horizontalDelta, behavior: reduced ? 'auto' : 'smooth' })
  }, [activeId, reduced])

  useEffect(() => {
    const chapter = chapterRef.current
    if (!chapter) return
    const screenLongEdge = Math.max(window.screen.width, window.screen.height)
    const shortMobile = window.innerWidth <= 940 && (screenLongEdge <= 760 || window.innerHeight < 600)
    chapter.dataset['shortMobile'] = shortMobile ? 'true' : 'false'
    return () => { delete chapter.dataset['shortMobile'] }
  }, [])

  return (
    <section ref={chapterRef} id="capabilities" aria-label={title ?? dictionary.capabilities.title} lang={locale} dir={dictionary.direction} className="cap-chapter">
      <div className="cap-shell">
        <header className="cap-heading" data-reveal={isAr ? 'rtl' : 'copy'}>
          <div className="cap-heading-code">
            <span>03</span><i /><span>{isAr ? 'العدسة' : 'Lens'}</span>
          </div>
          <div className="cap-heading-main">
            <div>
              <span className="cap-kicker">{label ?? dictionary.capabilities.label}</span>
              <h2>{title ?? dictionary.capabilities.title}</h2>
            </div>
            <p>{subtitle ?? dictionary.capabilities.subtitle}</p>
          </div>
        </header>

        <div className="cap-toggle" role="group" aria-label={isAr ? 'نوع العرض' : 'Capability view'}>
          {(['business', 'engineering'] as const).map(option => (
            <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>
              <span>{option === 'business' ? dictionary.capabilities.business : dictionary.capabilities.engineering}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="cap-layout cap-desktop">
          <div className="cap-rail">
            <div className="cap-rail-head">
              <span>{isAr ? 'فهرس الأنظمة' : 'System index'}</span>
              <span>{String(services.length).padStart(2, '0')} {isAr ? 'قدرات' : 'capabilities'}</span>
            </div>

            <div className="cap-list" onMouseLeave={() => setActiveId(openId ?? services[0]?.id ?? null)}>
            {services.map((service, index) => {
              const name = serviceName(service, view, locale)
              const tags = serviceTags(service, view).slice(0, 3)
              const outcomes = serviceOutcomes(service, view)
              const description = isAr ? service.business_subtext_ar : service.business_subtext
              const slug = serviceSlug(service)
              const open = openId === service.id
              const selected = openId === service.id
              return (
                <article
                  className={`cap-record${selected ? ' is-selected' : ''}${open ? ' is-open' : ''}`}
                  key={service.id}
                  onMouseEnter={() => setActiveId(service.id)}
                  onFocus={() => setActiveId(service.id)}
                >
                  <div className="cap-record-main">
                    <button
                      type="button"
                      data-cursor={open ? 'minus' : 'plus'}
                      aria-expanded={open}
                      aria-controls={`cap-panel-${service.id}`}
                      onClick={() => { setActiveId(service.id); setOpenId(open ? null : service.id) }}
                    >
                      <span className="cap-record-index">{service.idx ?? String(index + 1).padStart(2, '0')}</span>
                      <span className="cap-record-copy"><strong>{name}</strong><small>{tags.join(' · ')}</small></span>
                      <span className="cap-record-signal" aria-hidden="true"><i /></span>
                      <span className="cap-record-toggle" aria-hidden="true"><i /><i /></span>
                    </button>
                  </div>
                  <div
                    id={`cap-panel-${service.id}`}
                    className="cap-record-panel"
                    style={{ gridTemplateRows: open ? '1fr' : '0fr', transition: reduced ? 'none' : undefined }}
                  >
                    <div>
                      {description && <p>{description}</p>}
                      <div className="cap-record-outcomes">{outcomes.slice(0, 4).map((outcome, outcomeIndex) => (
                        <span key={outcome}><b>0{outcomeIndex + 1}</b><em>{outcome}</em></span>
                      ))}</div>
                      {slug && (
                        <Link className="cap-record-link" data-cursor="arrow" href={`${isAr ? '/ar' : ''}/services/${slug}`} aria-label={`${dictionary.capabilities.openService}: ${name}`}>
                          <span>{dictionary.capabilities.openService}</span><b>↗</b>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
            </div>
          </div>

          <div className="cap-visual"><LensInstrument service={active} services={services} view={view} locale={locale} /></div>
        </div>

        <div className="cap-mobile">
          {active && (
            <article
              id="cap-mobile-panel"
              className="cap-mobile-card"
              role="tabpanel"
              aria-label={activeName}
              onPointerDown={beginSwipe}
              onPointerUp={endSwipe}
              onPointerCancel={() => { swipeStartRef.current = null }}
            >
              <div className="cap-mobile-card__visual">
                <div>
                  <span>{isAr ? 'النظام النشط' : 'Active system'}</span>
                  <b>{active.idx ?? '00'} / {String(services.length).padStart(2, '0')}</b>
                </div>
                <MobileOrb index={active.idx ?? '00'} />
              </div>

              <div className="cap-mobile-card__copy">
                <div className="cap-mobile-card__tags">{activeTags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <h3>{activeName}</h3>
                {activeDescription && <p>{activeDescription}</p>}
                <div className="cap-mobile-card__outcomes">
                  {activeOutcomes.slice(0, 4).map((outcome, index) => <span key={outcome}><i>0{index + 1}</i><b>{outcome}</b></span>)}
                </div>
                {activeSlug && (
                  <Link href={`${isAr ? '/ar' : ''}/services/${activeSlug}`}>
                    <span>{dictionary.capabilities.openService}</span><b>↗</b>
                  </Link>
                )}
              </div>
            </article>
          )}

          <div ref={mobileSelectorRef} className="cap-mobile-selector" role="tablist" aria-label={isAr ? 'اختر القدرة' : 'Choose a capability'}>
            {services.map((service, index) => {
              const selected = active?.id === service.id
              return (
                <button
                  key={service.id}
                  type="button"
                  role="tab"
                  data-service-id={service.id}
                  aria-selected={selected}
                  aria-controls="cap-mobile-panel"
                  onClick={() => selectService(service)}
                >
                  <span>{service.idx ?? String(index + 1).padStart(2, '0')}</span>
                  <strong>{serviceName(service, view, locale)}</strong>
                  <i aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        .cap-chapter { position:relative;z-index:10;padding:clamp(82px,8vw,124px) clamp(24px,5vw,72px);overflow:hidden;color:var(--pine-800);background:#e4f5d4;background-image:radial-gradient(circle at 8% 18%,rgba(255,255,255,.72),transparent 31%),radial-gradient(circle at 90% 36%,rgba(160,211,125,.23),transparent 28%),linear-gradient(135deg,rgba(255,255,255,.22),transparent 48%); }
        .cap-chapter::before { content:'';position:absolute;inset:0;pointer-events:none;opacity:.38;background-image:linear-gradient(rgba(8,71,52,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(8,71,52,.035) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(180deg,transparent 2%,#000 28%,#000 86%,transparent); }
        .cap-chapter::after { content:'';position:absolute;width:42vw;aspect-ratio:1;right:-16vw;top:8%;pointer-events:none;border-radius:50%;border:1px solid rgba(8,71,52,.08);box-shadow:0 0 0 6vw rgba(8,71,52,.025),0 0 0 12vw rgba(8,71,52,.018); }
        .cap-shell { position:relative;z-index:1;width:min(100%,1480px);margin:0 auto; }
        .cap-heading-code { display:grid;grid-template-columns:auto minmax(80px,1fr) auto;align-items:center;gap:16px;font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(6,59,43,.48); }
        .cap-heading-code i { height:1px;background:linear-gradient(90deg,rgba(8,71,52,.26),rgba(8,71,52,.08)); }
        .cap-heading-code span:last-child { color:var(--pine-700); }
        .cap-heading-main { display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.65fr);align-items:end;gap:clamp(42px,7vw,112px);margin-top:clamp(28px,3.6vw,50px); }
        .cap-kicker { display:block;margin-bottom:10px;font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--pine-600); }
        .cap-heading h2 { max-width:none;margin:0;white-space:nowrap;font-family:var(--font-display);font-size:clamp(46px,4.7vw,70px);font-weight:570;line-height:.94;letter-spacing:-.06em; }
        [dir="rtl"] .cap-heading h2 { font-family:var(--font-display-ar);line-height:1.08;letter-spacing:-.035em; }
        .cap-heading-main > p { max-width:48ch;margin:0 0 7px;font-size:17px;line-height:1.65;color:rgba(6,59,43,.68); }
        [dir="rtl"] .cap-heading-main > p { font-family:var(--font-arabic);font-size:18px;line-height:1.85; }

        .cap-toggle { width:max-content;display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:clamp(34px,4.2vw,56px) 0 24px;padding:4px;border:1px solid rgba(8,71,52,.16);border-radius:999px;background:rgba(244,252,237,.48);box-shadow:inset 0 1px 0 rgba(255,255,255,.72),0 10px 28px rgba(8,71,52,.05);backdrop-filter:blur(12px); }
        .cap-toggle button { position:relative;min-height:42px;display:flex;align-items:center;justify-content:center;gap:10px;padding:0 18px;border-radius:999px;cursor:pointer;color:rgba(6,59,43,.52);transition:color 180ms ease,background-color 180ms ease,box-shadow 180ms ease,transform 140ms var(--ease-out); }
        .cap-toggle button:active { transform:scale(.975); }
        .cap-toggle button span { font-family:var(--font-mono);font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase; }
        [dir="rtl"] .cap-toggle button span { font-family:var(--font-arabic);font-size:12px;letter-spacing:0; }
        .cap-toggle button i { width:5px;height:5px;border-radius:50%;border:1px solid currentColor; }
        .cap-toggle button[aria-pressed="true"] { color:var(--tea-100);background:var(--pine-800);box-shadow:0 8px 20px rgba(6,59,43,.18),inset 0 1px 0 rgba(255,255,255,.1); }
        .cap-toggle button[aria-pressed="true"] i { background:var(--lime-300);border-color:var(--lime-300);box-shadow:0 0 10px rgba(206,241,123,.65); }

        .cap-desktop { display:grid; }
        .cap-mobile { display:none; }
        .cap-layout { grid-template-columns:minmax(420px,.9fr) minmax(500px,1.1fr);gap:clamp(22px,3.5vw,54px);align-items:start; }
        .cap-rail { position:relative;padding:9px;border:1px solid rgba(8,71,52,.16);border-radius:20px;background:linear-gradient(145deg,rgba(255,255,255,.46),rgba(205,237,179,.22));box-shadow:0 28px 70px rgba(6,59,43,.09),inset 0 1px 0 rgba(255,255,255,.82);backdrop-filter:blur(18px); }
        .cap-rail::before { content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.38),transparent 28%,transparent 72%,rgba(8,71,52,.035)); }
        .cap-rail-head { position:relative;min-height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-family:var(--font-mono);font-size:7px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(6,59,43,.48); }
        [dir="rtl"] .cap-rail-head { font-family:var(--font-arabic);font-size:11px;letter-spacing:0; }
        .cap-list { position:relative;display:flex;flex-direction:column;gap:7px; }
        .cap-record { position:relative;overflow:hidden;border:1px solid rgba(8,71,52,.12);border-radius:14px;background:rgba(236,249,225,.42);opacity:1;transform:translateZ(0);box-shadow:0 1px 0 rgba(255,255,255,.52);transition:transform 220ms var(--ease-out),border-color 180ms ease,background-color 180ms ease,box-shadow 220ms var(--ease-out); }
        .cap-record::before { content:'';position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(circle at 82% 20%,rgba(206,241,123,.26),transparent 35%);transition:opacity 220ms ease; }
        .cap-record.is-selected { border-color:rgba(105,156,63,.42);background:rgba(247,253,241,.78);transform:translateX(9px) translateY(-1px);box-shadow:-12px 18px 36px rgba(6,59,43,.1),inset 3px 0 0 var(--lime-300),inset 0 1px 0 rgba(255,255,255,.84); }
        [dir="rtl"] .cap-record.is-selected { transform:translateX(-9px) translateY(-1px);box-shadow:12px 18px 36px rgba(6,59,43,.1),inset -3px 0 0 var(--lime-300),inset 0 1px 0 rgba(255,255,255,.84); }
        .cap-record.is-selected::before { opacity:1; }
        .cap-record-main > button { position:relative;z-index:1;min-height:78px;display:grid;grid-template-columns:32px minmax(0,1fr) 28px 32px;align-items:center;gap:12px;width:100%;padding:0 13px;cursor:pointer;text-align:start;color:rgba(6,59,43,.7);transition:color 180ms ease,transform 140ms var(--ease-out); }
        .cap-record-main > button:active { transform:scale(.985); }
        .cap-record-index { font-family:var(--font-mono);font-size:8px;color:rgba(8,71,52,.46); }
        .cap-record-copy { min-width:0;display:flex;flex-direction:column;gap:7px; }
        .cap-record-copy strong { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-display);font-size:clamp(20px,1.65vw,27px);font-weight:550;letter-spacing:-.04em;color:inherit; }
        [dir="rtl"] .cap-record-copy strong { font-family:var(--font-display-ar);letter-spacing:-.02em; }
        .cap-record-copy small { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-mono);font-size:7px;letter-spacing:.11em;text-transform:uppercase;color:rgba(6,59,43,.4); }
        [dir="rtl"] .cap-record-copy small { font-family:var(--font-arabic);font-size:10px;letter-spacing:0; }
        .cap-record-signal { width:26px;aspect-ratio:1;display:grid;place-items:center;border:1px solid rgba(8,71,52,.14);border-radius:50%;background:rgba(255,255,255,.34);box-shadow:inset 0 1px 3px rgba(255,255,255,.72); }
        .cap-record-signal i { width:8px;aspect-ratio:1;border-radius:50%;background:rgba(8,71,52,.22);box-shadow:inset -2px -2px 3px rgba(3,12,9,.16);transition:background-color 180ms ease,box-shadow 180ms ease,transform 220ms var(--ease-out); }
        .cap-record.is-selected .cap-record-signal i { background:var(--lime-300);box-shadow:inset -2px -2px 3px rgba(84,122,34,.28),0 0 13px rgba(147,197,75,.58);transform:scale(1.15); }
        .cap-record-toggle { position:relative;width:30px;aspect-ratio:1;border:1px solid rgba(8,71,52,.18);border-radius:50%;background:rgba(255,255,255,.32); }
        .cap-record-toggle i { position:absolute;left:50%;top:50%;width:9px;height:1px;background:currentColor;transform:translate(-50%,-50%);transition:transform 180ms var(--ease-out),opacity 140ms ease; }
        .cap-record-toggle i:last-child { transform:translate(-50%,-50%) rotate(90deg); }
        .cap-record.is-open .cap-record-toggle i:last-child { opacity:0;transform:translate(-50%,-50%) rotate(0deg); }
        .cap-record.is-open .cap-record-toggle { color:var(--pine-800);background:var(--lime-300);border-color:rgba(105,156,63,.42); }
        .cap-record.is-selected .cap-record-main > button { color:var(--pine-800); }
        .cap-record-panel { position:relative;z-index:1;display:grid;grid-template-rows:0fr;transition:grid-template-rows 260ms var(--ease-drawer); }
        .cap-record-panel > div { min-height:0;overflow:hidden;padding-inline:57px 18px; }
        .cap-record-panel p { max-width:50ch;margin:2px 0 15px;font-size:13px;line-height:1.62;color:rgba(6,59,43,.62); }
        [dir="rtl"] .cap-record-panel p { font-family:var(--font-arabic);font-size:14px;line-height:1.82; }
        .cap-record-outcomes { display:flex;flex-wrap:wrap;gap:6px;padding-bottom:15px; }
        .cap-record-outcomes > span { min-height:27px;display:inline-flex;align-items:stretch;border:1px solid rgba(8,71,52,.16);border-radius:7px;background:rgba(255,255,255,.34);font-family:var(--font-mono);font-size:7px;letter-spacing:.07em;text-transform:uppercase;color:rgba(6,59,43,.72); }
        .cap-record-outcomes > span b { min-width:25px;display:grid;place-items:center;border-inline-end:1px solid rgba(8,71,52,.13);font-size:6px;color:var(--pine-600);background:rgba(8,71,52,.045); }
        .cap-record-outcomes > span em { padding:7px 8px;font-style:normal; }
        .cap-record-link { min-height:40px;display:flex;align-items:center;justify-content:space-between;margin:0 0 15px;padding:0 12px;border-radius:9px;color:var(--tea-100);background:var(--pine-800);font-family:var(--font-mono);font-size:7px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;transition:transform 140ms var(--ease-out),background-color 180ms ease; }
        [dir="rtl"] .cap-record-link { font-family:var(--font-arabic);font-size:11px;letter-spacing:0; }
        .cap-record-link:active { transform:scale(.985); }

        .cap-visual { position:sticky;top:88px;perspective:1200px; }
        .lens { overflow:hidden;color:var(--paper-100);border:1px solid rgba(8,71,52,.42);border-radius:22px;background:#06120e;box-shadow:0 34px 80px rgba(6,59,43,.18),0 8px 18px rgba(6,59,43,.1),inset 0 1px 0 rgba(255,255,255,.08);transform:translateZ(0); }
        .lens-head,.lens-foot { min-height:52px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 18px;font-family:var(--font-mono);font-size:7px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(242,245,236,.48); }
        .lens-head { border-bottom:1px solid rgba(205,237,179,.13);background:linear-gradient(90deg,rgba(11,91,67,.34),rgba(5,16,12,.12)); }
        .lens-head__label { display:flex;align-items:center;gap:9px; }
        .lens-head__label i { width:6px;aspect-ratio:1;border-radius:50%;background:var(--lime-300);box-shadow:0 0 14px rgba(206,241,123,.72);animation:lens-status 2.8s ease-in-out infinite; }
        .lens-stage { position:relative;min-height:570px;overflow:hidden;perspective:1000px;background-color:#071711;background-image:linear-gradient(rgba(205,237,179,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(205,237,179,.05) 1px,transparent 1px);background-size:44px 44px; }
        .lens-vignette { position:absolute;z-index:5;inset:0;pointer-events:none;background:radial-gradient(circle at 54% 43%,transparent 0 20%,rgba(6,18,14,.06) 44%,rgba(3,11,8,.8) 100%); }
        .lens-aurora { position:absolute;z-index:1;width:56%;aspect-ratio:1;border-radius:50%;pointer-events:none;filter:blur(18px);opacity:.36; }
        .lens-aurora--one { top:-18%;right:-11%;background:radial-gradient(circle,rgba(23,116,84,.68),transparent 67%);animation:lens-drift-one 13s ease-in-out infinite alternate; }
        .lens-aurora--two { left:-20%;bottom:-24%;background:radial-gradient(circle,rgba(206,241,123,.24),transparent 68%);animation:lens-drift-two 17s ease-in-out infinite alternate; }
        .lens-axis { position:absolute;z-index:2;pointer-events:none;opacity:.48; }
        .lens-axis--x { left:5%;right:5%;top:45%;height:1px;background:linear-gradient(90deg,transparent,rgba(206,241,123,.38),transparent); }
        .lens-axis--y { top:6%;bottom:14%;left:53%;width:1px;background:linear-gradient(180deg,transparent,rgba(206,241,123,.3),transparent); }
        .lens-scene { position:absolute;z-index:3;inset:3% 3% 13%;transform-style:preserve-3d;transform:perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0);transition:transform 240ms var(--ease-out);will-change:transform; }
        .lens-floor { position:absolute;width:72%;aspect-ratio:1;top:46%;left:53%;transform:translate(-50%,-50%) rotateX(72deg) rotateZ(-15deg);transform-style:preserve-3d;border:1px solid rgba(206,241,123,.16);background:linear-gradient(135deg,rgba(206,241,123,.05),transparent 60%);box-shadow:0 0 80px rgba(35,128,93,.12); }
        .lens-floor::before,.lens-floor::after,.lens-floor i { content:'';position:absolute;inset:var(--floor-inset);border:1px solid rgba(205,237,179,.1); }
        .lens-floor::before { --floor-inset:14%; }.lens-floor::after { --floor-inset:30%; }.lens-floor i:nth-child(1) { --floor-inset:43%;background:rgba(206,241,123,.1); }.lens-floor i:nth-child(2) { inset:50% 0 auto;height:1px;border:0;background:rgba(205,237,179,.13); }.lens-floor i:nth-child(3) { inset:0 auto 0 50%;width:1px;border:0;background:rgba(205,237,179,.13); }
        .lens-halo { position:absolute;top:45%;left:53%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%) translateZ(12px); }
        .lens-halo--outer { width:47%;border:1px dashed rgba(206,241,123,.15);box-shadow:0 0 0 18px rgba(206,241,123,.018),0 0 0 42px rgba(206,241,123,.012);animation:lens-spin 26s linear infinite; }
        .lens-halo--inner { width:28%;border:1px solid rgba(206,241,123,.2);box-shadow:inset 0 0 26px rgba(206,241,123,.035);animation:lens-spin-reverse 18s linear infinite; }
        .lens-orbit { position:absolute;top:45%;left:53%;border:1px solid rgba(206,241,123,.23);border-radius:50%;transform-style:preserve-3d;will-change:transform; }
        .lens-orbit::before { content:'';position:absolute;width:7px;aspect-ratio:1;left:-4px;top:50%;border-radius:50%;background:var(--lime-300);box-shadow:0 0 18px rgba(206,241,123,.86); }
        .lens-orbit::after { content:'';position:absolute;width:3px;aspect-ratio:1;right:11%;top:7%;border-radius:50%;background:var(--tea-200);box-shadow:0 0 10px rgba(206,241,123,.58); }
        .lens-orbit i { position:absolute;inset:8%;border:1px dashed rgba(205,237,179,.08);border-radius:50%; }
        .lens-orbit--one { width:74%;height:31%;animation:lens-orbit-one 17s linear infinite; }
        .lens-orbit--two { width:38%;height:72%;border-color:rgba(205,237,179,.14);animation:lens-orbit-two 22s linear infinite reverse; }
        .lens-orbit--three { width:58%;height:54%;border-color:rgba(206,241,123,.3);animation:lens-orbit-three 28s linear infinite; }
        .lens-orb { position:absolute;width:126px;aspect-ratio:1;top:45%;left:53%;transform:translate(-50%,-50%) translateZ(68px);border-radius:50%;display:grid;place-items:center;isolation:isolate;background:radial-gradient(circle at 31% 24%,#f0ffd2 0 3%,#c7f06d 8%,#47a55f 25%,#0d694d 51%,#063b2b 72%,#020b08 100%);box-shadow:inset -26px -30px 36px rgba(1,8,5,.78),inset 13px 12px 24px rgba(228,245,212,.18),0 28px 48px rgba(1,8,5,.56),0 0 48px rgba(206,241,123,.2); }
        .lens-orb::before { content:'';position:absolute;inset:-12px;border:1px solid rgba(206,241,123,.24);border-radius:50%;box-shadow:0 0 0 8px rgba(206,241,123,.018); }
        .lens-orb__surface { position:absolute;inset:7%;overflow:hidden;border-radius:50%;opacity:.38;background:repeating-linear-gradient(18deg,transparent 0 9px,rgba(228,245,212,.15) 10px,transparent 11px 18px);animation:lens-surface 18s linear infinite; }
        .lens-orb__latitude { position:absolute;left:13%;right:13%;top:50%;height:30%;border:1px solid rgba(228,245,212,.22);border-radius:50%;transform:translateY(-50%) rotate(-12deg); }
        .lens-orb__latitude--two { height:56%;transform:translateY(-50%) rotate(67deg);opacity:.54; }
        .lens-orb__shine { position:absolute;width:25%;height:12%;left:22%;top:18%;border-radius:50%;background:rgba(247,255,225,.5);filter:blur(5px);transform:rotate(-24deg); }
        .lens-orb > b { position:relative;z-index:2;font-family:var(--font-mono);font-size:10px;color:rgba(247,255,239,.94);text-shadow:0 2px 12px #020b08; }
        .lens-micro-orbs i { position:absolute;display:block;border-radius:50%;background:radial-gradient(circle at 30% 24%,#e4f5d4,#8bcf58 24%,#0b5b43 64%,#020a07);box-shadow:inset -5px -6px 9px rgba(1,8,5,.6),0 8px 15px rgba(1,8,5,.34),0 0 14px rgba(206,241,123,.22); }
        .lens-micro-orbs i:nth-child(1) { width:25px;aspect-ratio:1;left:18%;top:23%;animation:lens-float-one 7s ease-in-out infinite alternate; }
        .lens-micro-orbs i:nth-child(2) { width:14px;aspect-ratio:1;right:19%;top:29%;animation:lens-float-two 8.5s ease-in-out infinite alternate; }
        .lens-micro-orbs i:nth-child(3) { width:18px;aspect-ratio:1;right:24%;bottom:23%;animation:lens-float-three 10s ease-in-out infinite alternate; }
        .lens-nodes span { position:absolute;z-index:7;min-height:31px;max-width:154px;display:inline-flex;align-items:stretch;border:1px solid rgba(205,237,179,.18);border-radius:7px;background:rgba(4,15,11,.82);box-shadow:0 10px 25px rgba(1,8,5,.28),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(10px);font-family:var(--font-mono);font-size:7px;letter-spacing:.07em;text-transform:uppercase;color:rgba(242,245,236,.72); }
        .lens-nodes span i { min-width:28px;display:grid;place-items:center;border-inline-end:1px solid rgba(205,237,179,.14);font-style:normal;color:var(--lime-300);background:rgba(206,241,123,.045); }
        .lens-nodes span b { padding:8px 9px;font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .lens-nodes span em { position:absolute;width:34px;height:1px;top:50%;background:linear-gradient(90deg,rgba(206,241,123,.5),transparent); }
        .lens-nodes span:nth-child(1){top:13%;left:7%}.lens-nodes span:nth-child(1) em{left:100%}.lens-nodes span:nth-child(2){top:18%;right:6%}.lens-nodes span:nth-child(2) em{right:100%;transform:rotate(180deg)}.lens-nodes span:nth-child(3){top:49%;left:4%}.lens-nodes span:nth-child(3) em{left:100%}.lens-nodes span:nth-child(4){top:53%;right:4%}.lens-nodes span:nth-child(4) em{right:100%;transform:rotate(180deg)}
        .lens-selected { position:absolute;z-index:8;left:18px;right:18px;bottom:17px;display:flex;align-items:end;justify-content:space-between;gap:20px;padding:17px 18px;border:1px solid rgba(205,237,179,.14);border-radius:12px;background:linear-gradient(90deg,rgba(3,12,9,.84),rgba(7,27,20,.48));box-shadow:0 14px 30px rgba(1,8,5,.28);backdrop-filter:blur(12px); }
        .lens-selected span { font-family:var(--font-mono);font-size:7px;letter-spacing:.1em;text-transform:uppercase;color:var(--lime-300); }
        .lens-selected strong { max-width:72%;font-family:var(--font-display);font-size:clamp(23px,2.2vw,36px);font-weight:550;line-height:1;letter-spacing:-.045em;text-align:end;text-shadow:0 2px 18px rgba(3,12,9,.7); }
        [dir="rtl"] .lens-selected strong { font-family:var(--font-display-ar);letter-spacing:-.02em; }
        .lens-foot { display:grid;grid-template-columns:auto 1fr auto;border-top:1px solid rgba(205,237,179,.13);color:var(--lime-300);background:rgba(3,12,9,.92); }
        .lens-foot i { position:relative;height:1px;background:rgba(206,241,123,.15);overflow:hidden; }
        .lens-foot i b { position:absolute;width:30%;height:1px;background:var(--lime-300);animation:lens-scan 5s ease-in-out infinite alternate; }

        @keyframes lens-status { 50% { opacity:.42;transform:scale(.78); } }
        @keyframes lens-spin { to { transform:translate(-50%,-50%) translateZ(12px) rotate(360deg); } }
        @keyframes lens-spin-reverse { to { transform:translate(-50%,-50%) translateZ(12px) rotate(-360deg); } }
        @keyframes lens-orbit-one { from { transform:translate(-50%,-50%) rotateZ(-15deg) rotateX(64deg) rotate(0); } to { transform:translate(-50%,-50%) rotateZ(-15deg) rotateX(64deg) rotate(360deg); } }
        @keyframes lens-orbit-two { from { transform:translate(-50%,-50%) rotateZ(25deg) rotateY(68deg) rotate(0); } to { transform:translate(-50%,-50%) rotateZ(25deg) rotateY(68deg) rotate(360deg); } }
        @keyframes lens-orbit-three { from { transform:translate(-50%,-50%) rotateZ(66deg) rotateX(72deg) rotate(0); } to { transform:translate(-50%,-50%) rotateZ(66deg) rotateX(72deg) rotate(360deg); } }
        @keyframes lens-surface { to { transform:rotate(360deg); } }
        @keyframes lens-drift-one { to { transform:translate(-7%,9%) scale(1.08); } }
        @keyframes lens-drift-two { to { transform:translate(10%,-8%) scale(.94); } }
        @keyframes lens-float-one { to { transform:translate3d(12px,-18px,22px); } }
        @keyframes lens-float-two { to { transform:translate3d(-18px,14px,30px); } }
        @keyframes lens-float-three { to { transform:translate3d(12px,10px,18px); } }
        @keyframes lens-scan { from { transform:translateX(-10%); } to { transform:translateX(240%); } }

        /* Visibility and type hierarchy: supporting labels remain compact, but
           never depend on ultra-small, low-contrast type to create refinement. */
        .cap-heading-code,.cap-kicker { font-size:10px;color:rgba(6,59,43,.68); }
        .cap-heading h2 { font-size:clamp(44px,4.2vw,64px); }
        .cap-heading-main > p { color:rgba(6,59,43,.76); }
        .cap-toggle button span { font-size:10px; }
        .cap-rail-head { font-size:9px;color:rgba(6,59,43,.66); }
        .cap-record-index { font-size:10px;color:rgba(8,71,52,.64); }
        .cap-record-copy small { font-size:9px;color:rgba(6,59,43,.62); }
        .cap-record-panel p { font-size:15px;color:rgba(6,59,43,.74); }
        .cap-record-outcomes > span { font-size:9px;color:rgba(6,59,43,.82); }
        .cap-record-outcomes > span b { font-size:8px; }
        .cap-record-link { font-size:9px; }
        .lens-head,.lens-foot { font-size:9px;color:rgba(242,245,236,.68); }
        .lens-nodes span { min-height:34px;max-width:176px;font-size:9px;color:rgba(242,245,236,.82); }
        .lens-nodes span i { min-width:31px; }
        .lens-selected span { font-size:9px; }
        .cap-toggle button:focus-visible,.cap-record-main > button:focus-visible,.cap-record-link:focus-visible,.cap-mobile-selector button:focus-visible,.cap-mobile-card__copy > a:focus-visible { outline:2px solid var(--pine-700);outline-offset:3px; }
        .lens .lens-nodes span,.lens-head,.lens-foot { text-shadow:0 1px 2px rgba(0,0,0,.32); }

        @media (hover:hover) and (pointer:fine) {
          .cap-record:not(.is-selected):hover { transform:translateX(4px);border-color:rgba(8,71,52,.24);background:rgba(247,253,241,.66); }
          [dir="rtl"] .cap-record:not(.is-selected):hover { transform:translateX(-4px); }
          .cap-record-link:hover { background:#0b5b43; }
        }

        /* A standard-height desktop should present the complete system at
           100% zoom. Space is removed from chrome and the instrument—not from
           readable copy—so users never need to zoom out to understand it. */
        @media (min-width:941px) and (max-height:1050px) {
          .cap-chapter { padding-top:42px;padding-bottom:42px; }
          .cap-heading-main { margin-top:16px; }
          .cap-heading h2 { font-size:clamp(42px,3.6vw,56px); }
          .cap-heading-main > p { margin-bottom:3px;font-size:16px;line-height:1.55; }
          .cap-toggle { margin:18px 0 12px; }
          .cap-toggle button { min-height:44px; }
          .cap-layout { gap:clamp(18px,2.5vw,38px); }
          .cap-rail { padding:7px;border-radius:17px; }
          .cap-rail-head { min-height:34px; }
          .cap-list { gap:5px; }
          .cap-record { border-radius:11px; }
          .cap-record-main > button { min-height:59px;grid-template-columns:29px minmax(0,1fr) 27px 29px;gap:10px;padding-inline:11px; }
          .cap-record-copy { gap:3px; }
          .cap-record-copy strong { font-size:clamp(19px,1.4vw,23px); }
          .cap-record-panel > div { padding-inline:50px 14px; }
          .cap-record-panel p { margin:0 0 9px;font-size:14px;line-height:1.48; }
          .cap-record-outcomes { gap:5px;padding-bottom:9px; }
          .cap-record-outcomes > span { min-height:25px;font-size:9px; }
          .cap-record-outcomes > span em { padding:6px 7px; }
          .cap-record-link { min-height:44px;margin-bottom:9px; }
          .lens { border-radius:18px; }
          .lens-head,.lens-foot { min-height:42px; }
          .lens-stage { min-height:472px; }
          .lens-orb { width:110px; }
          .lens-selected { left:14px;right:14px;bottom:13px;padding:12px 14px; }
          .lens-selected strong { font-size:clamp(22px,2vw,31px); }
          .lens-nodes span { min-height:31px;font-size:9px; }
        }

        /* Laptop and split-screen heights need a second spatial step. The
           information scale stays intact while the surrounding stage tightens. */
        @media (min-width:941px) and (max-height:850px) {
          .cap-chapter { padding-top:32px;padding-bottom:32px; }
          .cap-heading-main { margin-top:12px; }
          .cap-heading h2 { font-size:clamp(42px,3.25vw,52px); }
          .cap-toggle { margin:14px 0 10px; }
          .cap-rail-head { min-height:32px; }
          .cap-list { gap:4px; }
          .cap-record-main > button { min-height:56px; }
          .cap-record-panel p { margin-bottom:7px; }
          .cap-record-outcomes { padding-bottom:7px; }
          .cap-record-link { margin-bottom:7px; }
          .lens-head,.lens-foot { min-height:40px; }
          .lens-stage { min-height:445px; }
          .lens-selected { bottom:12px; }
        }

        @media (max-width:940px) {
          .cap-chapter { min-height:100svh;padding:34px 16px calc(96px + env(safe-area-inset-bottom,0px)); }
          .cap-chapter::after { width:78vw;right:-42vw;top:17%; }
          .cap-heading-main { grid-template-columns:1fr;gap:10px;margin-top:18px; }
          .cap-heading h2 { font-size:clamp(29px,8vw,42px);letter-spacing:-.04em;word-spacing:.12em; }
          [dir="rtl"] .cap-heading h2 { word-spacing:normal; }
          .cap-heading-main > p { max-width:38ch;font-size:14px;line-height:1.5; }
          [dir="rtl"] .cap-heading-main > p { font-size:15px;line-height:1.65; }
          .cap-toggle { width:100%;margin:14px 0 10px; }
          .cap-toggle button { min-height:44px;padding-inline:8px; }
          .cap-desktop { display:none; }
          .cap-mobile { display:block; }
          .cap-mobile-selector { display:flex;gap:8px;overflow-x:auto;margin:8px -16px 0;padding:0 16px 4px;scroll-padding-inline:16px;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-inline:contain; }
          .cap-mobile-selector::-webkit-scrollbar { display:none; }
          .cap-mobile-selector button { position:relative;flex:0 0 min(44vw,172px);min-height:54px;display:grid;grid-template-columns:22px minmax(0,1fr) 6px;align-items:center;gap:7px;padding:0 11px;scroll-snap-align:center;border:1px solid rgba(8,71,52,.15);border-radius:12px;background:rgba(247,253,241,.54);box-shadow:inset 0 1px 0 rgba(255,255,255,.7);text-align:start;color:rgba(6,59,43,.62);transition:transform 160ms var(--ease-out),background-color 180ms ease,border-color 180ms ease; }
          .cap-mobile-selector button:active { transform:scale(.98); }
          .cap-mobile-selector button > span { font-family:var(--font-mono);font-size:8px;color:rgba(8,71,52,.68); }
          .cap-mobile-selector button > strong { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-display);font-size:14px;font-weight:570;letter-spacing:-.025em; }
          [dir="rtl"] .cap-mobile-selector button > strong { font-family:var(--font-display-ar);letter-spacing:-.015em; }
          .cap-mobile-selector button > i { width:6px;aspect-ratio:1;border-radius:50%;background:rgba(8,71,52,.2); }
          .cap-mobile-selector button[aria-selected="true"] { color:var(--pine-800);border-color:rgba(105,156,63,.38);background:rgba(255,255,255,.78);box-shadow:0 14px 30px rgba(6,59,43,.08),inset 3px 0 0 var(--lime-300); }
          [dir="rtl"] .cap-mobile-selector button[aria-selected="true"] { box-shadow:0 14px 30px rgba(6,59,43,.08),inset -3px 0 0 var(--lime-300); }
          .cap-mobile-selector button[aria-selected="true"] > i { background:var(--lime-300);box-shadow:0 0 11px rgba(125,174,58,.52); }
          .cap-mobile-card { overflow:hidden;border:1px solid rgba(8,71,52,.34);border-radius:18px;color:var(--paper-100);background:#071711;box-shadow:0 22px 46px rgba(6,59,43,.15),inset 0 1px 0 rgba(255,255,255,.06);touch-action:pan-y; }
          .cap-mobile-card__visual { min-height:92px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 17px 9px;overflow:hidden;background-image:radial-gradient(circle at 78% 48%,rgba(55,151,105,.24),transparent 38%),linear-gradient(rgba(205,237,179,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(205,237,179,.05) 1px,transparent 1px);background-size:auto,28px 28px,28px 28px;border-bottom:1px solid rgba(205,237,179,.12); }
          .cap-mobile-card__visual > div:first-child { display:flex;flex-direction:column;gap:7px;font-family:var(--font-mono);font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:rgba(242,245,236,.68); }
          .cap-mobile-card__visual > div:first-child b { font-size:9px;color:var(--lime-300); }
          .cap-mobile-orb { position:relative;flex:0 0 70px;aspect-ratio:1;display:grid;place-items:center;transform-style:preserve-3d; }
          .cap-mobile-orb::before { content:'';position:absolute;inset:15%;border:1px dashed rgba(206,241,123,.17);border-radius:50%;animation:lens-spin 24s linear infinite; }
          .cap-mobile-orb__ring { position:absolute;left:50%;top:50%;width:100%;height:38%;border:1px solid rgba(206,241,123,.24);border-radius:50%; }
          .cap-mobile-orb__ring--one { animation:lens-mobile-orbit-one 15s linear infinite; }
          .cap-mobile-orb__ring--two { width:54%;height:96%;border-color:rgba(205,237,179,.16);animation:lens-mobile-orbit-two 19s linear infinite reverse; }
          .cap-mobile-orb > span { position:relative;width:46px;aspect-ratio:1;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle at 31% 24%,#efffd2 0 4%,#b9e963 11%,#329661 34%,#0b6047 60%,#03110c 100%);box-shadow:inset -11px -12px 15px rgba(1,8,5,.72),inset 6px 5px 9px rgba(228,245,212,.16),0 11px 19px rgba(1,8,5,.46),0 0 24px rgba(206,241,123,.16); }
          .cap-mobile-orb > span b { font-family:var(--font-mono);font-size:8px;color:var(--paper-100);text-shadow:0 2px 8px #020b08; }
          .cap-mobile-card__copy { padding:15px 16px 14px; }
          .cap-mobile-card__tags { display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px; }
          .cap-mobile-card__tags span { font-family:var(--font-mono);font-size:8px;letter-spacing:.07em;text-transform:uppercase;color:var(--lime-300); }
          .cap-mobile-card__copy h3 { margin:0;font-family:var(--font-display);font-size:clamp(26px,7.6vw,34px);font-weight:560;line-height:.98;letter-spacing:-.045em; }
          [dir="rtl"] .cap-mobile-card__copy h3 { font-family:var(--font-display-ar);line-height:1.25;letter-spacing:-.02em; }
          .cap-mobile-card__copy > p { margin:9px 0 11px;font-size:13px;line-height:1.5;color:rgba(242,245,236,.74); }
          [dir="rtl"] .cap-mobile-card__copy > p { font-family:var(--font-arabic);font-size:15px;line-height:1.82; }
          .cap-mobile-card__outcomes { display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:11px; }
          .cap-mobile-card__outcomes > span { min-height:38px;display:grid;grid-template-columns:25px 1fr;align-items:center;border:1px solid rgba(205,237,179,.16);border-radius:8px;background:rgba(205,237,179,.045);font-family:var(--font-mono);font-size:8px;letter-spacing:.025em;text-transform:uppercase;color:rgba(242,245,236,.82); }
          .cap-mobile-card__outcomes i { display:grid;align-self:stretch;place-items:center;border-inline-end:1px solid rgba(205,237,179,.12);font-style:normal;color:var(--lime-300); }
          .cap-mobile-card__outcomes b { padding:8px;font-weight:400;line-height:1.35; }
          .cap-mobile-card__copy > a { min-height:44px;display:flex;align-items:center;justify-content:space-between;margin-top:11px;padding:0 14px;border-radius:10px;color:var(--ink-950);background:var(--lime-300);font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;transition:transform 140ms var(--ease-out); }
          [dir="rtl"] .cap-mobile-card__copy > a { font-family:var(--font-arabic);font-size:12px;letter-spacing:0; }
          .cap-mobile-card__copy > a:active { transform:scale(.98); }
          @keyframes lens-mobile-orbit-one { from { transform:translate(-50%,-50%) rotate(-18deg) rotateX(65deg) rotate(0); } to { transform:translate(-50%,-50%) rotate(-18deg) rotateX(65deg) rotate(360deg); } }
          @keyframes lens-mobile-orbit-two { from { transform:translate(-50%,-50%) rotate(28deg) rotateY(68deg) rotate(0); } to { transform:translate(-50%,-50%) rotate(28deg) rotateY(68deg) rotate(360deg); } }
        }

        @media (max-width:430px) {
          .cap-mobile-selector button { flex-basis:min(46vw,172px); }
        }

        @media (max-width:940px) {
          .cap-chapter[data-short-mobile='true'] { padding-top:28px; }
          .cap-chapter[data-short-mobile='true'] .cap-heading-main { gap:0;margin-top:14px; }
          .cap-chapter[data-short-mobile='true'] .cap-heading-main > p {
            position:absolute;
            width:1px;
            height:1px;
            padding:0;
            margin:-1px;
            overflow:hidden;
            clip:rect(0,0,0,0);
            white-space:nowrap;
            border:0;
          }
        }

        @media (max-width:350px) {
          .cap-mobile-card__outcomes { grid-template-columns:1fr; }
        }

        @media (prefers-reduced-motion:reduce) {
          .lens-scene { transition:none;transform:none !important; }
          .lens-head__label i,.lens-halo,.lens-orbit,.lens-orb__surface,.lens-micro-orbs i,.lens-aurora,.lens-foot i b,.cap-mobile-orb::before,.cap-mobile-orb__ring { animation:none !important; }
        }
      `}</style>
    </section>
  )
}
