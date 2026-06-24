# Nous (nous.qa) — Full Website Audit

*Prepared June 2026. Based on the live site at https://www.nous.qa and its public web presence.*

---

## Executive summary

Nous has a strong visual identity — the bilingual "quiet luxury" positioning, the Arabic calligraphy, and the engineered aesthetic are genuinely distinctive and a real differentiator in the Doha market. The problems are not taste; they are **technical hygiene, discoverability, and content depth**. The site looks like a premium product but behaves, to search engines and answer engines, like a near-empty single page. A few of the issues are outright production bugs.

Fixing the items in the "Critical" tier below will likely have more impact on inbound leads than any redesign.

---

## Tier 1 — Critical (fix this week)

### 1. Broken Open Graph / Twitter share image
Every page outputs:
```
og:image:        http://localhost:3000/opengraph-image?6367e01ec160a37d
twitter:image:   http://localhost:3000/opengraph-image?6367e01ec160a37d
```
This is a developer's local URL that shipped to production. Result: **no preview image renders anywhere** the site is shared (WhatsApp, LinkedIn, Instagram, X, Slack, iMessage). It is also `http://`, not `https://`.

**Fix:** point the OG image generator at the production origin (`https://nous.qa/opengraph-image…`). This is almost certainly a `NEXT_PUBLIC_SITE_URL` / `metadataBase` value still set to `localhost:3000` in your environment config. Validate afterwards with the LinkedIn Post Inspector and the X Card Validator.

### 2. Canonical / domain inconsistency (www vs non-www)
- Site serves from: `https://www.nous.qa`
- Canonical tag says: `https://nous.qa`
- `og:url` says: `https://nous.qa`

Search engines see two competing "official" addresses, which dilutes ranking signals. **Pick one host**, 301-redirect the other to it permanently, and make `canonical`, `og:url`, sitemap entries, and internal links all agree. (Given the brand is "nous.qa", the cleaner choice is the non-www `https://nous.qa` as the primary, with `www` redirecting to it.)

### 3. No structured data (schema.org)
There is no Organization / LocalBusiness / Service schema on the page. This is the single biggest miss for both local SEO and AEO (see those sections). Add it now.

---

## Tier 2 — SEO

**What's working:** indexable meta robots (`index, follow`), a real `<h1>`, a clean title, valid viewport, and a `theme-color`. WebP hero image. Skip-to-content link present (good for both a11y and crawl).

**Gaps:**

- **Thin content / single-page architecture.** The homepage plus a contact page is essentially the entire site. There are no service pages, no case-study pages, no blog. Google has very little text to rank, and almost no keyword surface area. Each of your six capabilities (AI, Full-Stack, Mobile, E-Commerce, Cloud, Design) deserves its own indexable page targeting real search demand (e.g. "AI development company Qatar", "Shopify agency Doha", "mobile app development Qatar").

- **Portfolio links leak equity outward.** Your three projects (Stitched, Elite Collections, The Seventh Sense) link straight to external client domains. Build an **internal case-study page for each** (`/work/stitched`, etc.) that tells the story, shows results, and links out from there. This keeps crawl depth and authority on your domain and gives you rich, rankable content.

- **Title not optimized for intent.** "Nous — Engineered Intelligence" is brand-poetic but contains zero commercial keywords. Consider: `Nous — AI, Web & App Development Agency in Doha, Qatar`. Keep the poetry for the H1; put the searchable terms in the title and meta description.

- **`meta-keywords` is obsolete.** Google ignores it and it can hand competitors your keyword list. Harmless but worth removing.

- **No `hreflang` / no true Arabic version.** You mix Arabic and English inline, but there is no dedicated Arabic page or `hreflang` annotation. In Qatar, Arabic-language search is a large, under-served channel. A proper `ar` version with `hreflang="ar-QA"` ↔ `hreflang="en"` reciprocal tags would meaningfully expand reach.

- **Verify the `<html lang>` attribute** is set correctly (and switches for any Arabic version). Could not confirm it is present.

- **Confirm `robots.txt` and `sitemap.xml` exist** and that the sitemap lists the canonical host. Submit the sitemap in Google Search Console and Bing Webmaster Tools.

- **JS-rendered content risk.** The site is animation-heavy (preloader, GSAP/Three.js per your own stack). Make sure the core copy is in the server-rendered HTML, not injected client-side, or crawlers and answer engines may see an empty shell. Test with Search Console's URL Inspection "view rendered HTML".

---

## Tier 3 — AEO (Answer Engine Optimization)

This is where the site is weakest, and it matters more every month as buyers ask ChatGPT, Perplexity, Gemini, and Google AI Overviews "who's the best AI/web agency in Doha?"

Answer engines extract **structured, factual, text-based** information. Your site gives them almost none. To become quotable:

1. **Add `Organization` + `LocalBusiness` schema** with: legal name, logo, full Doha address, geo-coordinates, phone (+974 7748 4004), email, opening hours, and `sameAs` links to your LinkedIn and Instagram. This is the canonical record answer engines and Google's Knowledge Panel pull from.

2. **Add `Service` schema** for each capability, and `CreativeWork`/`Project` schema for each case study.

3. **Write a real FAQ section** with `FAQPage` schema — plain Q&A like "What does Nous do?", "Where is Nous located?", "What technologies do you build with?", "How fast do you respond?". Answer engines lift these almost verbatim.

4. **Add an indexable, text-rich About section.** Right now there is no crawlable paragraph that states, in plain prose, "Nous is a Doha, Qatar-based technology agency specializing in AI, full-stack, mobile, e-commerce, and cloud." Models can't cite what isn't written.

5. **Get cited off-site.** Listings (next section) and any press/blog mentions are how LLMs learn you exist and form their summary of you.

---

## Tier 4 — Performance & loading

I could not run Lighthouse against your domain directly, so run **PageSpeed Insights** (pagespeed.web.dev) and **WebPageTest** yourself and watch these specific risks, all implied by what's on the page:

- **The "[ LOADING ]" preloader.** Intro/preloader animations routinely tank Largest Contentful Paint and First Contentful Paint because they delay real content. Make sure the hero text renders immediately and the animation layers on top, rather than gating content behind the loader. Mobile users on Qatari 4G will feel this.

- **Heavy animation libraries.** Three.js + GSAP + Framer Motion together are large JS bundles. Code-split, lazy-load the 3D/orbit visuals below the fold, and ship nothing animation-related until after first paint. Audit your total JS transfer size.

- **Hero image.** `hero-1920.webp` is good (WebP), but serve responsive `srcset` sizes so phones don't download the 1920px asset. Add `fetchpriority="high"` to the LCP image and `width`/`height` to prevent layout shift (CLS).

- **Fonts.** Use `font-display: swap` and preload the primary font to avoid invisible-text flashes, especially with Arabic + Latin glyph sets.

- **Sentry sample rate** is 0.1 (10%) — fine for production. No action needed, but your release hash and trace IDs are exposed in meta tags; low risk, but you can strip them from the public HTML.

**Targets to aim for (mobile):** LCP < 2.5s, CLS < 0.1, INP < 200ms, total JS < ~300KB compressed.

---

## Tier 5 — Marketing & conversion

**Strengths:** clear primary CTAs ("Initialize Project", "WhatsApp Us"), WhatsApp + phone + email all one tap away (smart for the Gulf market where WhatsApp is the default business channel), a "reply within 24h" promise, and a genuinely nice multi-step brief form with a completion meter.

**Improvements:**

- **Stylized CTA language may cost conversions.** "Initialize Project", "Transmit Brief", "Begin your brief" are on-brand but abstract. A/B test against plainer verbs ("Start your project", "Send brief") — clarity usually wins on the money button even for luxury brands.

- **No social proof / trust signals.** No testimonials, client logos, results metrics, team, or "founded in / projects delivered" numbers. Three projects shown, but no outcomes ("increased conversion X%", "launched in Y weeks"). Buyers comparing agencies need proof. Add 2–3 short client quotes and any hard results.

- **No pricing or engagement-model cue.** Even a "projects typically start from…" or "how we work" reduces unqualified inquiries and pre-sells serious leads.

- **Capture before they leave.** Consider a lightweight lead magnet (a short "how we scope a project" PDF, or a newsletter) so visitors who aren't ready to start a brief still enter your funnel.

- **Add analytics + conversion tracking.** Confirm GA4 (or Plausible) and Meta/LinkedIn pixels are firing, with form submissions and WhatsApp clicks tracked as conversion events. You can't improve what you can't measure.

---

## Tier 6 — Reach & off-site presence

This is the highest-ROI area after the Tier 1 bugs. A search across the major "agency in Qatar" directories shows **Nous is not listed in any of them**, while competitors are:

- **Google Business Profile** — no evidence of one. This is the most important fix. A verified GBP with category, address, photos, and reviews makes you eligible for Google Maps, the local pack, and "tech agency near me" searches. Free, high impact.
- **Clutch.co** — competitors ranked here; clients filter by reviews. Create a profile and request reviews from Stitched, Elite Collections, and The Seventh Sense.
- **Sortlist, TechBehemoths, The Manifest, GoodFirms** — same story. Free listings, real referral traffic.
- **Social depth.** You have LinkedIn and Instagram linked, but for a design-led agency Instagram should be a portfolio engine (process reels, before/afters, the Arabic-typography aesthetic). LinkedIn should publish case studies and founder POV to build B2B trust.
- **Backlinks / PR.** Pitch a "Doha agency behind [notable local brand]" angle to Qatari tech/business outlets and startup ecosystem blogs (QSTP community, etc.). Each quality backlink lifts both SEO and AEO citation.

---

## Tier 7 — Accessibility & UX polish

- Skip-to-content link present — good. Continue the momentum:
- Ensure all interactive "Tap to explore" / hover orbits are **keyboard reachable** and have visible focus states; hover-only interactions exclude touch and keyboard users.
- Verify **color contrast** against your light `#F9F8F6` background meets WCAG AA (4.5:1 for body text) — pale luxury palettes often fail here.
- Provide **descriptive `alt` text** on the hero and project images (several currently appear empty).
- Respect `prefers-reduced-motion` — offer a reduced/no-animation path for the preloader and 3D orbits.
- Ensure the Arabic text is marked with `dir="rtl"` and `lang="ar"` on its containers so screen readers and browsers render it correctly.

---

## Prioritized action plan

**Do now (hours, high impact):**
1. Fix the `localhost:3000` OG/Twitter image → production URL.
2. Resolve www vs non-www; set 301 + consistent canonical/og:url.
3. Create and verify a Google Business Profile.
4. Add Organization + LocalBusiness schema with full NAP + `sameAs`.

**This month (days, high impact):**
5. Build internal case-study pages for the three projects.
6. Add an indexable About paragraph + FAQ section (with `FAQPage` schema).
7. List on Clutch, Sortlist, TechBehemoths, The Manifest; request client reviews.
8. Run PageSpeed Insights; fix the preloader-driven LCP and lazy-load animation bundles.
9. Confirm GA4 + conversion tracking on form and WhatsApp clicks.

**This quarter (sustained):**
10. Build per-capability service pages targeting Qatar search terms.
11. Ship a proper Arabic version with reciprocal `hreflang`.
12. Add testimonials, results metrics, and a "how we work" section.
13. Start a small content/portfolio cadence on LinkedIn + Instagram.

---

*Note: performance figures (LCP/CLS/INP) should be confirmed with PageSpeed Insights and WebPageTest against the live domain — I flagged the likely causes but did not measure them directly. Everything in Tier 1 was observed directly in your production page source.*
