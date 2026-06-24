# Nous Website — What To Do Next

Everything in this file requires action **outside the codebase** — on Cloudflare, Contabo, external platforms, or in your admin panel. The code changes are already deployed; these are the manual steps that complete the picture.

---

## DEPLOY FIRST

Before anything else: **deploy the updated code** to your Contabo server.

```bash
# In the nous-platform directory
pnpm turbo build --filter=@nous/web
# then restart your Node process / PM2 / Docker container
```

---

## 1. Set the environment variable on your server

Add this to your `.env.production` (or however you manage env vars on Contabo):

```
NEXT_PUBLIC_SITE_URL=https://nous.qa
```

This fixes the `localhost:3000` OG image bug. After setting it, rebuild and restart.

**Validate:** Share a link to https://nous.qa on WhatsApp or LinkedIn. You should see the dark "Engineered Intelligence" preview image appear. Or use the LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

---

## 2. Fix www vs non-www redirect in Cloudflare

Your site serves on `www.nous.qa` but everything canonical points to `nous.qa`. Fix in Cloudflare:

1. Go to **Cloudflare Dashboard** > your nous.qa zone > **Rules** > **Redirect Rules**
2. Create a new rule:
   - **When:** Hostname equals `www.nous.qa`
   - **Then:** Redirect to `https://nous.qa/$1` (301 - Permanent)
3. Save and deploy

**Validate:** Visit https://www.nous.qa in a browser — it should 301 redirect to https://nous.qa.

---

## 3. Create a Google Business Profile

This is the highest-ROI action after the code deploy. Free, takes 20 minutes, has significant impact on local search and Google Maps.

1. Go to https://business.google.com
2. Search for "Nous" — if no existing profile appears, click **Add your business**
3. Fill in:
   - **Business name:** Nous
   - **Category:** Software Company (primary), Web Design Company (secondary)
   - **Address:** Your Doha address
   - **Phone:** +974 7748 4004
   - **Website:** https://nous.qa
   - **Hours:** Sun-Thu 9am-6pm (adjust to actual hours)
4. Verify via postcard or phone (Google will guide you)
5. After verification: upload your logo, 3-5 photos of the workspace/team, and write a 250-word description

**Then:** Ask Stitched, Elite Collections, and The Seventh Sense each for a Google review. Even 3-4 verified reviews puts you ahead of competitors with none.

---

## 4. Update the Testimonials section with real quotes

The testimonials on the homepage (`/src/sections/testimonials/Testimonials.tsx`) currently use seed copy. Replace with real quotes from your clients.

Edit the `testimonials` array in that file — each entry needs:
- `quote` — the actual client quote (max 3 lines)
- `author` — their name or title
- `role` — company name
- `initials` — first letter of company name (used as avatar)

**Ask each client:** "Can I use a short quote from you on our website? Even 1-2 sentences about the experience." Most will say yes.

---

## 5. Update the Case Study pages with real content

The three case study pages at `/work/stitched`, `/work/elite-collections`, and `/work/the-seventh-sense` have accurate placeholder copy but need:

1. **Real project images** — add the `image_url` field in each page's `project` object. Use a real screenshot, a styled photo, or generate one.
2. **Real metrics** — replace the example numbers (e.g. "6 weeks", "78%") with your actual project data
3. **Real descriptions** — review and update the `overview`, `challenge`, and `solution` text to match what actually happened

Files to edit:
- `apps/web/src/app/work/stitched/page.tsx`
- `apps/web/src/app/work/elite-collections/page.tsx`
- `apps/web/src/app/work/the-seventh-sense/page.tsx`

---

## 6. List on agency directories

None of these cost money. All of them generate backlinks and referral traffic.

| Platform | URL | Priority |
|---|---|---|
| Clutch.co | https://clutch.co/get-listed | High — clients filter here |
| Sortlist | https://www.sortlist.com | High |
| TechBehemoths | https://techbehemoths.com | Medium |
| The Manifest | https://themanifest.com | Medium |
| GoodFirms | https://www.goodfirms.co | Medium |

For each: create a profile, add all services, upload logo and work samples, then request reviews from your existing clients by emailing them the review link.

---

## 7. Submit your sitemap to Google Search Console

1. Go to https://search.google.com/search-console
2. Add property: `https://nous.qa` (URL prefix type)
3. Verify ownership — easiest method is the HTML file method (Cloudflare makes the DNS TXT record method tricky)
4. Go to **Sitemaps** > submit `https://nous.qa/sitemap.xml`
5. Use **URL Inspection** to check that Google can render your homepage (tests for the JS-render issue)

Also submit to Bing: https://www.bing.com/webmasters

---

## 8. Set up Google Analytics 4 + conversion tracking

If not already done:

1. Create a GA4 property at https://analytics.google.com
2. Add the Measurement ID to your env as `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
3. The `AnalyticsInit` component in the codebase will pick it up automatically (check `/src/components/analytics/AnalyticsInit.tsx` to confirm the env var name)
4. Set up conversion events:
   - Form submission on `/contact` → mark as conversion
   - WhatsApp button click (`https://wa.me/...`) → mark as conversion

---

## 9. Update social profiles with the new service page URLs

Now that service pages exist, update your LinkedIn and Instagram bio/links:

- **LinkedIn Company Page:** Update the website URL to `https://nous.qa`. Add a post linking to each service page as you publish them.
- **Instagram bio:** Keep `nous.qa` — the new pages give you 6 link-in-bio options via a tool like Later or direct Linktree.

---

## 10. Link case studies from the Works section in your admin

The Works section is database-driven (Supabase). Log into your admin panel and make sure the three projects have:
- `url` field pointing to the internal case study (e.g. `/work/stitched`), **not** the external client site
- A real `image_url` (upload a project screenshot to Supabase storage)
- `active = true`

This ensures the homepage cards link to your case study pages, keeping SEO equity on your domain.

---

## 11. Update the sameAs links in the schema

In `apps/web/src/app/layout.tsx`, find the `sameAs` array and replace the placeholder URLs with your real LinkedIn and Instagram profile URLs:

```ts
sameAs: [
  'https://www.linkedin.com/company/nous-qa',   // replace with actual URL
  'https://www.instagram.com/nous.qa',           // replace with actual handle
],
```

---

## 12. Consider adding Arabic pages (longer term)

The hreflang annotation pointing to `https://nous.qa/ar` is already in the code. When you are ready to build Arabic versions:

1. Create `/app/ar/page.tsx` (homepage in Arabic)
2. Mirror the service pages under `/app/ar/services/ai/page.tsx` etc.
3. The homepage `About` section already has an Arabic column — expand from there

This is the highest-upside long-term channel for Qatar-market search.

---

## Quick reference: what was changed in code

| File | What changed |
|---|---|
| `app/layout.tsx` | `metadataBase`, updated title with keywords, removed `meta-keywords`, upgraded JSON-LD to `LocalBusiness` + `FAQPage` schema, added `hreflang` link tags |
| `app/page.tsx` | Added `About`, `Testimonials`, `HowWeWork` sections to homepage |
| `app/sitemap.ts` | All pages listed: homepage, contact, 3 case studies, 6 service pages |
| `app/contact/page.tsx` | Full OG metadata added |
| `app/work/stitched/page.tsx` | New — internal case study page |
| `app/work/elite-collections/page.tsx` | New — internal case study page |
| `app/work/the-seventh-sense/page.tsx` | New — internal case study page |
| `app/services/ai/page.tsx` | New — service page with schema |
| `app/services/full-stack/page.tsx` | New — service page with schema |
| `app/services/mobile/page.tsx` | New — service page with schema |
| `app/services/ecommerce/page.tsx` | New — service page with schema |
| `app/services/cloud/page.tsx` | New — service page with schema |
| `app/services/design/page.tsx` | New — service page with schema |
| `sections/about/About.tsx` | New — About + FAQ section (server component, AEO-ready) |
| `sections/testimonials/Testimonials.tsx` | New — client quotes section |
| `sections/howwework/HowWeWork.tsx` | New — process + engagement model section |
| `sections/work/CaseStudyPage.tsx` | New — shared case study layout component |
| `sections/service/ServicePage.tsx` | New — shared service page layout component |
