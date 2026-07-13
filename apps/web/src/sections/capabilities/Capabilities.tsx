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
  const outcomes = service ? serviceOutcomes(service, view).slice(0, 6) : []
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

  return (
    <div className="lens" aria-hidden="true" onPointerMove={moveScene} onPointerLeave={resetScene}>
      <div className="lens-head">
        <span>{isAr ? 'العدسة / النتيجة' : 'Lens / Outcome View'}</span>
        <span>{view === 'business' ? (isAr ? 'أثر' : 'Impact') : (isAr ? 'بنية' : 'Architecture')}</span>
      </div>
      <div className="lens-stage">
        <div className="lens-vignette" />
        <div className="lens-scene" ref={sceneRef}>
          <div className="lens-plane"><i /><i /><i /></div>
          <div className="lens-orbit lens-orbit--one"><i /></div>
          <div className="lens-orbit lens-orbit--two"><i /></div>
          <div className="lens-orbit lens-orbit--three"><i /></div>
          <div className="lens-core"><i /><b /><span>{service?.idx ?? '00'}</span></div>
        </div>
        <div className="lens-axis lens-axis--x" />
        <div className="lens-axis lens-axis--y" />
        <div className="lens-reticle"><i /><i /><i /><i /></div>
        <div className="lens-selected">
          <span>{service?.idx ?? '00'}</span>
          <strong>{name || (isAr ? 'اختر نظاماً' : 'Select a system')}</strong>
        </div>
        <div className="lens-nodes">
          {(outcomes.length ? outcomes : services.slice(0, 6).map(item => serviceName(item, view, locale))).map((outcome, index) => (
            <span key={`${outcome}-${index}`} style={{ '--node-index': index } as React.CSSProperties}>
              <i>0{index + 1}</i><b>{outcome}</b>
            </span>
          ))}
        </div>
      </div>
      <div className="lens-foot">
        <span>{isAr ? 'المدخل: تحدٍ معقّد' : 'Input: complex challenge'}</span>
        <i />
        <span>{isAr ? 'المخرج: نظام واضح' : 'Output: clear system'}</span>
      </div>
    </div>
  )
}

export default function Capabilities({ services, locale = 'en', label, title, subtitle }: CapabilitiesProps) {
  const reduced = !!useReducedMotion()
  const dictionary = getDictionary(locale)
  const isAr = locale === 'ar'
  const [view, setView] = useState<ViewMode>('business')
  const [activeId, setActiveId] = useState<string | null>(services[0]?.id ?? null)
  const [openId, setOpenId] = useState<string | null>(services[0]?.id ?? null)
  const active = services.find(service => service.id === activeId) ?? services[0]

  return (
    <section id="capabilities" aria-label={title ?? dictionary.capabilities.title} lang={locale} dir={dictionary.direction} className="cap-chapter">
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

        <div className="cap-layout">
          <div className="cap-list">
            {services.map((service, index) => {
              const name = serviceName(service, view, locale)
              const tags = serviceTags(service, view).slice(0, 3)
              const outcomes = serviceOutcomes(service, view)
              const slug = serviceSlug(service)
              const open = openId === service.id
              const selected = activeId === service.id
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
                      <strong>{name}</strong>
                      <span className="cap-record-tags">{tags.join(' · ')}</span>
                      <i aria-hidden="true" />
                    </button>
                    {slug && (
                      <Link data-cursor="arrow" href={`${isAr ? '/ar' : ''}/services/${slug}`} aria-label={`${dictionary.capabilities.openService}: ${name}`}>↗</Link>
                    )}
                  </div>
                  <div
                    id={`cap-panel-${service.id}`}
                    className="cap-record-panel"
                    style={{ gridTemplateRows: open ? '1fr' : '0fr', transition: reduced ? 'none' : undefined }}
                  >
                    <div>
                      <p>{isAr ? service.business_subtext_ar || subtitle || dictionary.capabilities.subtitle : service.business_subtext || subtitle || dictionary.capabilities.subtitle}</p>
                      <div>{outcomes.map((outcome, outcomeIndex) => (
                        <span key={outcome}><b>0{outcomeIndex + 1}</b><em>{outcome}</em></span>
                      ))}</div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="cap-visual"><LensInstrument service={active} services={services} view={view} locale={locale} /></div>
        </div>
      </div>

      <style>{`
        .cap-chapter { position: relative; z-index: 10; padding: clamp(80px, 8vw, 118px) clamp(24px, 5vw, 72px); color: var(--pine-800); background: var(--tea-100); overflow: hidden; }
        .cap-shell { width: min(100%, 1480px); margin: 0 auto; }
        .cap-heading-code { display: grid; grid-template-columns: auto minmax(80px,1fr) auto; align-items: center; gap: 16px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(6,59,43,.48); }
        .cap-heading-code i { height: 1px; background: rgba(8,71,52,.2); }
        .cap-heading-code span:last-child { color: var(--pine-700); }
        .cap-heading-main { display: grid; grid-template-columns: minmax(0,1fr) minmax(300px,.65fr); align-items: end; gap: clamp(42px, 7vw, 112px); margin-top: clamp(30px, 4vw, 54px); }
        .cap-kicker { display: block; margin-bottom: 11px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--pine-600); }
        .cap-heading h2 { max-width: none; margin: 0; white-space: nowrap; font-family: var(--font-display); font-size: clamp(46px, 4.8vw, 72px); font-weight: 560; line-height: .94; letter-spacing: -.06em; }
        [dir="rtl"] .cap-heading h2 { font-family: var(--font-display-ar); line-height: 1.08; letter-spacing: -.035em; }
        .cap-heading-main > p { max-width: 48ch; margin: 0 0 8px; font-size: 17px; line-height: 1.65; color: rgba(6,59,43,.68); }
        [dir="rtl"] .cap-heading-main > p { font-family: var(--font-arabic); font-size: 18px; line-height: 1.85; }
        .cap-toggle { display: flex; gap: 4px; margin: clamp(34px, 4.5vw, 58px) 0 24px; border-bottom: 1px solid rgba(8,71,52,.18); }
        .cap-toggle button { min-height: 48px; display: flex; align-items: center; gap: 12px; padding: 0 20px; cursor: pointer; color: rgba(6,59,43,.55); }
        .cap-toggle button span { font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        [dir="rtl"] .cap-toggle button span { font-family: var(--font-arabic); font-size: 13px; letter-spacing: 0; }
        .cap-toggle button i { width: 5px; height: 5px; border-radius: 50%; border: 1px solid currentColor; }
        .cap-toggle button[aria-pressed="true"] { color: var(--pine-700); }
        .cap-toggle button[aria-pressed="true"] i { background: currentColor; box-shadow: 0 0 12px rgba(8,71,52,.28); }
        .cap-layout { display: grid; grid-template-columns: minmax(420px,.92fr) minmax(440px,1.08fr); gap: clamp(46px, 8vw, 128px); align-items: start; }
        .cap-list { border-top: 1px solid rgba(8,71,52,.22); }
        .cap-record { border-bottom: 1px solid rgba(8,71,52,.18); opacity: 1; transform: none; }
        .cap-record-main { display: grid; grid-template-columns: 1fr 52px; }
        .cap-record-main > button { min-height: 82px; display: grid; grid-template-columns: 34px minmax(150px,1fr) auto 12px; align-items: center; gap: 14px; width: 100%; cursor: pointer; text-align: start; color: rgba(6,59,43,.72); transition: color var(--motion-ui) ease, background-color var(--motion-ui) ease; }
        .cap-record-main > a { min-height: 52px; align-self: center; display: grid; place-items: center; border-inline-start: 1px solid rgba(8,71,52,.16); font-size: 18px; color: rgba(6,59,43,.5); transition: color var(--motion-ui) ease, background var(--motion-ui) ease; }
        .cap-record-main > a:hover { color: var(--tea-100); background: var(--pine-700); }
        .cap-record-index { font-family: var(--font-mono); font-size: 9px; color: rgba(8,71,52,.55); }
        .cap-record-main strong { font-family: var(--font-display); font-size: clamp(21px, 1.8vw, 29px); font-weight: 530; letter-spacing: -.035em; color: inherit; }
        [dir="rtl"] .cap-record-main strong { font-family: var(--font-display-ar); letter-spacing: -.02em; }
        .cap-record-tags { font-family: var(--font-mono); font-size: 8px; letter-spacing: .1em; text-transform: uppercase; color: rgba(6,59,43,.45); white-space: nowrap; }
        .cap-record-main button > i { width: 8px; height: 8px; border-right: 1px solid currentColor; border-bottom: 1px solid currentColor; transform: rotate(45deg) translate(-2px,-2px); transition: transform var(--motion-ui) var(--ease-out); }
        .cap-record.is-open .cap-record-main button > i { transform: rotate(225deg) translate(-1px,-1px); }
        .cap-record.is-selected .cap-record-main > button { color: var(--pine-700); background: rgba(8,71,52,.035); }
        .cap-record-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--motion-ui) var(--ease-drawer); }
        .cap-record-panel > div { min-height: 0; overflow: hidden; padding-inline: 48px 20px; }
        .cap-record-panel p { max-width: 55ch; margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: rgba(6,59,43,.64); }
        [dir="rtl"] .cap-record-panel p { font-family: var(--font-arabic); font-size: 15px; line-height: 1.8; }
        .cap-record-panel > div > div { display: flex; flex-wrap: wrap; gap: 7px; padding-bottom: 24px; }
        .cap-record-panel span { min-height: 29px; display: inline-flex; align-items: center; gap: 8px; padding: 0 10px 0 0; border: 1px solid rgba(8,71,52,.22); background: rgba(255,255,255,.12); font-family: var(--font-mono); font-size: 8px; letter-spacing: .08em; text-transform: uppercase; color: rgba(6,59,43,.78); }
        .cap-record-panel span b { align-self: stretch; min-width: 27px; display: grid; place-items: center; border-inline-end: 1px solid rgba(8,71,52,.18); background: rgba(8,71,52,.055); font-size: 7px; font-weight: 700; color: var(--pine-600); }
        .cap-record-panel span em { font-style: normal; }
        .cap-visual { position: sticky; top: 92px; }
        .lens { color: var(--paper-100); border: 1px solid rgba(8,71,52,.32); background: #07130f; box-shadow: 0 24px 64px rgba(6,59,43,.12); }
        .lens-head, .lens-foot { min-height: 48px; display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 0 16px; font-family: var(--font-mono); font-size: 8px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: rgba(242,245,236,.5); }
        .lens-head { border-bottom: 1px solid rgba(205,237,179,.14); background: linear-gradient(90deg,rgba(8,71,52,.36),rgba(7,17,14,.12)); }
        .lens-stage { position: relative; min-height: 500px; overflow: hidden; perspective: 900px; background-color: #091813; background-image: linear-gradient(rgba(205,237,179,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(205,237,179,.055) 1px,transparent 1px); background-size: 42px 42px; }
        .lens-vignette { position: absolute; inset: 0; z-index: 4; pointer-events: none; background: radial-gradient(circle at 54% 44%,transparent 0 22%,rgba(7,17,14,.08) 48%,rgba(4,12,9,.76) 100%); }
        .lens-scene { position: absolute; z-index: 2; inset: 7% 5% 15%; transform-style: preserve-3d; transform: perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0); transition: transform 220ms var(--ease-out); will-change: transform; }
        .lens-plane { position: absolute; width: 58%; aspect-ratio: 1; top: 46%; left: 53%; transform: translate(-50%,-50%) rotateX(68deg) rotateZ(-18deg); transform-style: preserve-3d; }
        .lens-plane::before { content:''; position:absolute; inset:0; border:1px solid rgba(206,241,123,.16); background:radial-gradient(circle,rgba(206,241,123,.075),transparent 64%); box-shadow:0 0 80px rgba(11,91,67,.18); }
        .lens-plane i { position:absolute; inset:var(--plane-inset); border:1px solid rgba(206,241,123,.12); }
        .lens-plane i:nth-child(1){--plane-inset:16%}.lens-plane i:nth-child(2){--plane-inset:32%}.lens-plane i:nth-child(3){--plane-inset:45%;background:rgba(206,241,123,.18);box-shadow:0 0 35px rgba(206,241,123,.18)}
        .lens-orbit { position:absolute; top:46%; left:53%; border:1px solid rgba(206,241,123,.22); border-radius:50%; transform-style:preserve-3d; }
        .lens-orbit::before,.lens-orbit::after { content:''; position:absolute; border-radius:50%; }
        .lens-orbit::before { width:7px;height:7px;left:-4px;top:50%;background:var(--lime-300);box-shadow:0 0 16px rgba(206,241,123,.8); }
        .lens-orbit::after { inset:8%;border:1px dashed rgba(205,237,179,.09); }
        .lens-orbit i { position:absolute; width:3px;height:3px;right:12%;top:8%;border-radius:50%;background:var(--tea-200);box-shadow:0 0 10px rgba(206,241,123,.6); }
        .lens-orbit--one { width:72%;height:38%;transform:translate(-50%,-50%) rotateZ(-16deg) rotateX(62deg); }
        .lens-orbit--two { width:48%;height:72%;transform:translate(-50%,-50%) rotateZ(22deg) rotateY(66deg);border-color:rgba(205,237,179,.13); }
        .lens-orbit--three { width:58%;height:58%;transform:translate(-50%,-50%) rotateZ(64deg) rotateX(70deg);border-color:rgba(206,241,123,.3); }
        .lens-core { position:absolute; width:86px;aspect-ratio:1;top:46%;left:53%;transform:translate(-50%,-50%) translateZ(54px);border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 34% 28%,#e4f5d4 0 4%,#b6e85b 11%,#157257 44%,#063b2b 70%,#07110e 100%);box-shadow:inset -18px -20px 30px rgba(3,12,9,.72),inset 8px 8px 18px rgba(228,245,212,.2),0 18px 36px rgba(3,12,9,.54),0 0 42px rgba(206,241,123,.18); }
        .lens-core::before { content:'';position:absolute;inset:-14px;border:1px solid rgba(206,241,123,.22);border-radius:50%; }
        .lens-core::after { content:'';position:absolute;inset:-25px;border:1px dashed rgba(206,241,123,.12);border-radius:50%;animation:lens-core-spin 22s linear infinite; }
        .lens-core i { position:absolute;width:24%;height:8%;top:18%;left:22%;border-radius:50%;background:rgba(228,245,212,.38);filter:blur(3px);transform:rotate(-24deg); }
        .lens-core b { position:absolute;width:6px;height:6px;border-radius:50%;right:-18px;top:48%;background:var(--lime-300);box-shadow:0 0 12px rgba(206,241,123,.8); }
        .lens-core span { position:relative;font-family:var(--font-mono);font-size:9px;font-weight:700;color:rgba(242,245,236,.9);text-shadow:0 1px 8px #07110e; }
        .lens-axis { position:absolute;z-index:1;pointer-events:none;opacity:.46; }
        .lens-axis--x { left:7%;right:7%;top:46%;height:1px;background:linear-gradient(90deg,transparent,rgba(206,241,123,.5),transparent); }
        .lens-axis--y { top:8%;bottom:12%;left:53%;width:1px;background:linear-gradient(180deg,transparent,rgba(206,241,123,.34),transparent); }
        .lens-reticle { position:absolute;z-index:5;top:46%;left:53%;width:150px;aspect-ratio:1;transform:translate(-50%,-50%);border:1px solid rgba(206,241,123,.08);border-radius:50%;pointer-events:none; }
        .lens-reticle i { position:absolute;width:12px;height:1px;background:rgba(206,241,123,.45); }.lens-reticle i:nth-child(1){left:-6px;top:50%}.lens-reticle i:nth-child(2){right:-6px;top:50%}.lens-reticle i:nth-child(3){top:-1px;left:calc(50% - 6px);transform:rotate(90deg)}.lens-reticle i:nth-child(4){bottom:-1px;left:calc(50% - 6px);transform:rotate(90deg)}
        .lens-selected { position:absolute;z-index:7;left:18px;bottom:18px;max-width:72%;display:flex;flex-direction:column;gap:5px; }
        [dir="rtl"] .lens-selected { left:auto;right:18px; }
        .lens-selected span { font-family:var(--font-mono);font-size:8px;color:var(--lime-300); }
        .lens-selected strong { font-family:var(--font-display);font-size:clamp(23px,2.4vw,38px);font-weight:540;letter-spacing:-.04em;text-shadow:0 2px 20px rgba(3,12,9,.72); }
        [dir="rtl"] .lens-selected strong { font-family:var(--font-display-ar);letter-spacing:-.02em; }
        .lens-nodes span { position:absolute;z-index:6;max-width:150px;min-height:27px;display:inline-flex;align-items:stretch;border:1px solid rgba(205,237,179,.18);background:rgba(5,16,12,.88);font-family:var(--font-mono);font-size:7px;letter-spacing:.07em;text-transform:uppercase;color:rgba(242,245,236,.72);box-shadow:0 8px 20px rgba(3,12,9,.22); }
        .lens-nodes span i { min-width:27px;display:grid;place-items:center;border-inline-end:1px solid rgba(205,237,179,.15);font-style:normal;color:var(--lime-300);background:rgba(206,241,123,.05); }
        .lens-nodes span b { padding:7px 8px;font-weight:400; }
        .lens-nodes span:nth-child(1){top:12%;left:7%}.lens-nodes span:nth-child(2){top:16%;right:6%}.lens-nodes span:nth-child(3){top:42%;left:3%}.lens-nodes span:nth-child(4){top:46%;right:3%}.lens-nodes span:nth-child(5){bottom:20%;left:21%}.lens-nodes span:nth-child(6){bottom:15%;right:11%}
        .lens-foot { display:grid;grid-template-columns:auto 1fr auto;border-top:1px solid rgba(205,237,179,.14);color:var(--lime-300);background:rgba(5,16,12,.92); }
        .lens-foot i { height:1px;background:linear-gradient(90deg,rgba(206,241,123,.16),rgba(206,241,123,.6),rgba(206,241,123,.16)); }
        @keyframes lens-core-spin { to { transform:rotate(360deg); } }

        @media (max-width: 940px) {
          .cap-chapter { padding: 76px 20px 88px; }
          .cap-heading-main { grid-template-columns: 1fr; gap: 22px; margin-top: 28px; }
          .cap-heading h2 { font-size: clamp(29px, 8vw, 42px); }
          .cap-layout { display: flex; flex-direction: column-reverse; gap: 34px; }
          .cap-list, .cap-visual { width: 100%; }
          .cap-visual { position: static; }
          .lens-stage { min-height: 310px; }
          .lens-scene { inset: 5% 2% 14%; }
          .lens-plane { width: 54%; }
          .lens-core { width: 68px; }
          .lens-reticle { width: 126px; }
          .lens-nodes span { font-size: 6px; max-width: 116px; }
          .lens-nodes span i { min-width: 23px; }
          .lens-nodes span b { padding: 6px; }
          .cap-record-main > button { min-height: 74px; grid-template-columns: 28px 1fr 12px; gap: 10px; }
          .cap-record-tags { display: none; }
          .cap-record-main strong { font-size: 21px; }
        }
        @media (max-width: 430px) {
          .cap-toggle { display: grid; grid-template-columns: 1fr 1fr; }
          .cap-toggle button { justify-content: center; padding-inline: 8px; }
          .lens-stage { min-height: 280px; }
          .lens-nodes span:nth-child(n+5) { display: none; }
          .lens-nodes span:nth-child(1){top:10%;left:4%}.lens-nodes span:nth-child(2){top:13%;right:3%}.lens-nodes span:nth-child(3){top:41%;left:2%}.lens-nodes span:nth-child(4){top:44%;right:2%}
          .cap-record-main { grid-template-columns: 1fr 46px; }
          .cap-record-panel > div { padding-inline: 38px 4px; }
        }
        @media (hover:hover) and (pointer:fine) {
          .cap-record-main > button:hover { background: rgba(8,71,52,.045); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lens-scene { transition:none;transform:none !important; }
          .lens-core::after { animation:none; }
        }
      `}</style>
    </section>
  )
}
