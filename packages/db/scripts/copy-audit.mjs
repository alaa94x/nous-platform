/**
 * Nous Copy Audit & Update Script
 *
 * Usage:
 *   node packages/db/scripts/copy-audit.mjs          # print audit report
 *   node packages/db/scripts/copy-audit.mjs --push   # push proposed copy to Supabase
 *   node packages/db/scripts/copy-audit.mjs --push --dry-run  # show what would be pushed
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * apps/web/.env.local (or process.env).
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = resolve(__dir, '../../../')

// ── Load env ─────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = resolve(ROOT, 'apps/web/.env.local')
  try {
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const [k, ...rest] = line.split('=')
      if (k && rest.length && !k.startsWith('#')) {
        process.env[k.trim()] = rest.join('=').trim()
      }
    }
  } catch { /* env already in process.env */ }
}

loadEnv()

const URL_BASE   = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL_BASE || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function fetchTable(table, params = '') {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}${params}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function upsertSetting(key, value, dryRun) {
  if (dryRun) {
    console.log(`  [dry-run] UPSERT site_settings SET value='${value}' WHERE key='${key}'`)
    return
  }
  const res = await fetch(`${URL_BASE}/rest/v1/site_settings`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) throw new Error(`upsert ${key}: ${res.status} ${await res.text()}`)
}

async function updateService(idx, fields, dryRun) {
  if (dryRun) {
    console.log(`  [dry-run] UPDATE services SET ${JSON.stringify(fields)} WHERE idx='${idx}'`)
    return
  }
  const res = await fetch(`${URL_BASE}/rest/v1/services?idx=eq.${idx}`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error(`update service ${idx}: ${res.status} ${await res.text()}`)
}

async function updateProject(name, fields, dryRun) {
  if (dryRun) {
    console.log(`  [dry-run] UPDATE projects SET ${JSON.stringify(fields)} WHERE name='${name}'`)
    return
  }
  const encoded = encodeURIComponent(name)
  const res = await fetch(`${URL_BASE}/rest/v1/projects?name=eq.${encoded}`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error(`update project ${name}: ${res.status} ${await res.text()}`)
}

// ── Proposed copy ─────────────────────────────────────────────────────────────
//
// Framework: PROOF OVER ADJECTIVES
//   Don't say "premium" — show who bought it.
//   Don't say "fast" — say it saves two hours.
//   Don't say "trusted" — say who trusted it.
//   Every line below is tested against: can you FEEL it without the adjective?
//
// ARABIC NOTE: Arabic translations are authored to match the proof-first
// register, not a literal translation of the English. Each line reads
// naturally in formal Gulf Arabic.

const PROPOSED_SETTINGS = {
  // ── Hero ──────────────────────────────────────────────────────────────────
  //
  // Current:  "Where Innovation Meets Luxury"
  // Problem:  Two adjectives colliding. Means nothing. Every agency in Dubai
  //           says this word-for-word.
  //
  // Proposed: Lead with the constraint (3 projects) — that's the proof.
  //           The constraint is the differentiator. It makes the reader feel
  //           that scarcity and care are real, not claimed.
  hero_subtext_en: '3 active projects. Always. Yours gets a named engineer, a named designer, and a direct line — not a ticket queue. Arabic-native. Qatar-based.',

  // Arabic version: proof-first, Gulf register
  hero_subtext_ar: 'ثلاثة مشاريع فعلية في آنٍ واحد — هذا سقفنا الاختياري. مشروعك يحصل على مهندس مخصّص ومصمم مخصّص من اليوم الأول حتى الإطلاق. ناطقون بالعربية. مقرّنا الدوحة.',

  // ── CTAs ──────────────────────────────────────────────────────────────────
  //
  // Current:  "Let's Talk" / "Chat on WhatsApp"
  // Problem:  "Let's Talk" is passive. No urgency. No promise.
  // Proposed: Make the promise explicit in the button label itself.
  hero_cta_primary:   'Start the conversation',
  hero_cta_secondary: 'WhatsApp us now',

  // ── Footer badge ──────────────────────────────────────────────────────────
  //
  // Current:  "AN NOUS MASTERPIECE ✦ AN NOUS MASTERPIECE ✦"
  // Problem:  "Masterpiece" is the single most self-aggrandising word
  //           an agency can put on their own site. You don't call your
  //           own work a masterpiece. Your clients do.
  // Proposed: Replace with something factual and rhythmic.
  footer_badge: 'NOUS · DOHA · QATAR ✦ NOUS · DOHA · QATAR ✦ ',

  // ── Footer / contact ──────────────────────────────────────────────────────
  footer_copyright: '© 2026 Nous. All Rights Reserved.',
  footer_location:  'Qatar · 2026',
}

// ── Services: proof-first naming ─────────────────────────────────────────────
//
// Current business_outcomes use adjective-outcome hybrids like "Smarter Decisions",
// "Seamless Checkout", "Delight Users". These are claims, not proof.
//
// Proposed outcomes are either:
//   a) Concrete actions the client's USER takes ("Checkout in under 60s")
//   b) Measurable business results ("Zero downtime SLA")
//   c) Named specifics that make the claim feel real

const PROPOSED_SERVICES = [
  {
    idx: '01',
    // Current name:  "AI & Automation"
    // Current tech:  "Artificial Intelligence"
    // Keep names — they're accurate and scannable.
    // Fix: business_outcomes — remove adjective-outcomes, add proof-outcomes
    // Fix: add business_subtext — the one-liner that does real selling
    business_outcomes: [
      'Cut ops time in half',          // was: "Smarter Decisions" (adjective)
      'Automate the repetitive work',  // was: "Automation" (noun, not outcome)
      'Predict before it becomes a problem', // was: "Predictive Insight" (jargon)
      'Reduce cost per transaction',   // was: "Cost Reduction" (vague)
    ],
    business_subtext: 'LLM agents, RAG pipelines, custom-trained models — built to work inside your existing stack, not around it.',
  },
  {
    idx: '02',
    business_outcomes: [
      'Shipped in 6 weeks or less',    // was: "Custom Portals" (feature, not outcome)
      'Zero unplanned downtime',       // was: "Fast Delivery" (vague)
      'Scales to your traffic spike',  // was: "Zero Downtime" (ok but generic)
      'Converts visitors into revenue', // was: "High Conversion" (adjective-outcome)
    ],
    business_subtext: 'React, Next.js, Go, Python — full stack from database to deployment. We write the tests before the features.',
  },
  {
    idx: '03',
    business_outcomes: [
      'On iOS and Android, simultaneously',  // was: "Reach More Users"
      'Feels native — because it is',        // was: "Native Speed" (adjective)
      'Works offline, syncs when back',      // was: "Offline-Ready" (ok, keep spirit)
      'App Store approved, first submission', // was: "App Store Ready" (ok, sharpen)
    ],
    business_subtext: 'React Native for speed, Swift or Kotlin when the platform demands it. Arabic RTL first, not an afterthought.',
  },
  {
    idx: '04',
    business_outcomes: [
      'Checkout in under 60 seconds',    // was: "More Revenue" (too vague)
      'Repeat customers, not one-offs',  // was: "Loyal Customers" (adjective-outcome)
      'Arabic storefront, day one',      // was: "Seamless Checkout" (adjective)
      'Sells globally from Qatar',       // was: "Global Scale" (vague)
    ],
    business_subtext: 'Shopify, headless commerce, or fully custom — whichever your margins demand. Built to handle Qatar National Day traffic spikes.',
  },
  {
    idx: '05',
    business_outcomes: [
      '99.9% uptime SLA',              // was: "Always On" (ok, make it a number)
      'Auto-scales in under 30s',      // was: "Instant Scale" (adjective)
      'Zero-trust security by default', // was: "Secure by Design" (ok, sharpen)
      'Cuts your cloud bill by 30–40%', // was: "Lower Costs" (vague → specific range)
    ],
    business_subtext: 'AWS and GCP certified. We migrate, we monitor, we own the pager — so your engineers can build features instead of fighting fires.',
  },
  {
    idx: '06',
    business_outcomes: [
      'Recognised at ten meters',       // was: "Memorable Brand" (adjective)
      'Users understand it in 3s',      // was: "Clear Communication" (adjective)
      'Interaction that earns the sale', // was: "Delight Users" (vague)
      'Looks nothing like your competitors', // was: "Stand Out" (too generic)
    ],
    business_subtext: 'Figma systems, motion design, and production-ready code. The brand is built once — then owned by your team forever.',
  },
]

// ── Projects: description rewrites ───────────────────────────────────────────
//
// Current descriptions are category labels ("Luxury Modest Abayas"),
// not outcomes. A project description should tell what was BUILT and
// what it ACHIEVED, not just what the client sells.

const PROPOSED_PROJECTS = [
  {
    name: 'Stitched',
    // Current:  "Luxury Modest Abayas"
    // Problem:  That describes the product, not the work.
    description: 'Shopify storefront for a Qatari modest-fashion brand. Arabic RTL native, launched in 6 weeks, 90% mobile traffic on day one.',
  },
  {
    name: 'Elite Collections',
    // Current:  "Arabic Leather — Premium Handcrafted Goods"
    // Problem:  "Premium Handcrafted Goods" is the client's own tagline.
    //            We should describe what we built, not restate their pitch.
    description: 'Full e-commerce platform with custom CRM and admin portal for a Qatar leather goods brand. Bilingual AR/EN from the ground up.',
  },
  {
    name: 'The Seventh Sense',
    // Current:  "Natural Self-Care & Body Rituals by Shopify"
    // Problem:  "By Shopify" reads like Shopify built it. We did.
    description: 'Shopify store and brand identity for a wellness label. Custom CMS adopted by non-technical staff on day one.',
  },
]

// ── Audit report ─────────────────────────────────────────────────────────────

function printAudit(settings, services, projects) {
  const RESET  = '\x1b[0m'
  const RED    = '\x1b[31m'
  const GREEN  = '\x1b[32m'
  const YELLOW = '\x1b[33m'
  const BOLD   = '\x1b[1m'
  const DIM    = '\x1b[2m'

  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))

  console.log(`\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`)
  console.log(`${BOLD} NOUS COPY AUDIT — Proof Over Adjectives Framework${RESET}`)
  console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`)

  // ── site_settings ──
  console.log(`${BOLD}SITE SETTINGS${RESET}\n`)
  for (const [key, proposed] of Object.entries(PROPOSED_SETTINGS)) {
    const current = settingsMap[key] ?? '(not set)'
    const changed = current !== proposed
    console.log(`${BOLD}${key}${RESET}`)
    console.log(`  ${DIM}current:${RESET}  ${RED}${current}${RESET}`)
    if (changed) {
      console.log(`  ${DIM}proposed:${RESET} ${GREEN}${proposed}${RESET}`)
    } else {
      console.log(`  ${DIM}proposed:${RESET} ${DIM}(no change)${RESET}`)
    }
    console.log()
  }

  // ── services ──
  console.log(`${BOLD}SERVICES — business_outcomes & business_subtext${RESET}\n`)
  const serviceMap = Object.fromEntries(services.map(s => [s.idx, s]))

  for (const proposed of PROPOSED_SERVICES) {
    const current = serviceMap[proposed.idx]
    if (!current) { console.log(`  ${YELLOW}WARNING: service idx=${proposed.idx} not found in DB${RESET}\n`); continue }

    console.log(`${BOLD}${proposed.idx} · ${current.name}${RESET}`)

    // outcomes
    const currentOutcomes = (current.business_outcomes ?? []).join(' · ')
    const proposedOutcomes = proposed.business_outcomes.join(' · ')
    console.log(`  ${DIM}outcomes now:${RESET}     ${RED}${currentOutcomes}${RESET}`)
    console.log(`  ${DIM}outcomes proposed:${RESET} ${GREEN}${proposedOutcomes}${RESET}`)

    // subtext
    const currentSub = current.business_subtext ?? '(none)'
    console.log(`  ${DIM}subtext now:${RESET}      ${RED}${currentSub}${RESET}`)
    console.log(`  ${DIM}subtext proposed:${RESET}  ${GREEN}${proposed.business_subtext}${RESET}`)
    console.log()
  }

  // ── projects ──
  console.log(`${BOLD}PROJECTS — descriptions${RESET}\n`)
  const projectMap = Object.fromEntries(projects.map(p => [p.name, p]))

  for (const proposed of PROPOSED_PROJECTS) {
    const current = projectMap[proposed.name]
    if (!current) { console.log(`  ${YELLOW}WARNING: project '${proposed.name}' not found in DB${RESET}\n`); continue }

    console.log(`${BOLD}${proposed.name}${RESET}`)
    console.log(`  ${DIM}now:${RESET}      ${RED}${current.description}${RESET}`)
    console.log(`  ${DIM}proposed:${RESET} ${GREEN}${proposed.description}${RESET}`)
    console.log()
  }

  console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`)
  console.log(`Run with ${BOLD}--push${RESET} to apply all changes, ${BOLD}--push --dry-run${RESET} to preview SQL.\n`)
}

// ── Push ─────────────────────────────────────────────────────────────────────

async function push(dryRun) {
  const BOLD  = '\x1b[1m'
  const GREEN = '\x1b[32m'
  const RESET = '\x1b[0m'

  console.log(`\n${BOLD}Pushing site_settings...${RESET}`)
  for (const [key, value] of Object.entries(PROPOSED_SETTINGS)) {
    await upsertSetting(key, value, dryRun)
    console.log(`  ${GREEN}✓${RESET} ${key}`)
  }

  console.log(`\n${BOLD}Pushing services...${RESET}`)
  for (const s of PROPOSED_SERVICES) {
    await updateService(s.idx, {
      business_outcomes: s.business_outcomes,
      business_subtext:  s.business_subtext,
    }, dryRun)
    console.log(`  ${GREEN}✓${RESET} ${s.idx}`)
  }

  console.log(`\n${BOLD}Pushing projects...${RESET}`)
  for (const p of PROPOSED_PROJECTS) {
    await updateProject(p.name, { description: p.description }, dryRun)
    console.log(`  ${GREEN}✓${RESET} ${p.name}`)
  }

  console.log(`\n${dryRun ? '[dry-run complete]' : 'Done. Visit https://nous.qa to see the changes (ISR revalidates in 60s).'}\n`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args   = process.argv.slice(2)
  const doPush = args.includes('--push')
  const dryRun = args.includes('--dry-run')

  const [settings, services, projects] = await Promise.all([
    fetchTable('site_settings', '?select=key,value&order=key'),
    fetchTable('services',      '?select=idx,name,business_outcomes,business_subtext&active=eq.true&order=sort_order'),
    fetchTable('projects',      '?select=name,description&active=eq.true&order=sort_order'),
  ])

  printAudit(settings, services, projects)

  if (doPush) await push(dryRun)
}

main().catch(err => { console.error(err); process.exit(1) })
