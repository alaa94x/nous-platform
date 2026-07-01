# Nous UI/UX Polish Plan

Comprehensive audit of every section — what is broken, what is weak, and exactly what to do about it.
Sorted by section, then by viewport, then by priority (P1 = ship-blocker, P2 = quality, P3 = enhancement).

---

## 0. Global / Cross-section Issues

### 0.1 Cursor — no fallback on slow-load [P1]
The custom cursor (`Cursor.tsx`) starts hidden until the component mounts. If JS is slow or blocked, the body has `cursor: none` permanently and the user sees no cursor at all.

**Fix:** Add a `<noscript>` style block that resets cursor to `auto`, and add a `cursor: auto` class to `body` by default in CSS — remove it via JS when the cursor component is ready. Or: set `cursor: auto` on `body` as the baseline and only switch to `none` after mounting.

```css
/* globals.css - change this: */
body { cursor: none; }
/* to this: */
body { cursor: auto; }
/* Then in Cursor.tsx, after mounting: */
document.body.style.cursor = 'none'
/* And in cleanup: */
document.body.style.cursor = 'auto'
```

### 0.2 Scroll-reveal fallback — 2-second forced reveal is too long [P1]
`Hero.tsx` has a 2000ms IntersectionObserver fallback. On slow connections, elements stay invisible for 2 full seconds. Drop to 800ms.

```ts
const fallback = setTimeout(() => {
  document.querySelectorAll<HTMLElement>('.reveal:not(.visible)').forEach(reveal)
}, 800) // was 2000
```

### 0.3 `window.addEventListener('scroll', ...)` in Nav — non-passive violation [P2]
`Nav.tsx` already uses `{ passive: true }` — this is correct. **No change needed here.** But check that `Cursor.tsx` and any other component using scroll listeners also adds `{ passive: true }`.

### 0.4 No loading state for the page data fetch [P2]
`page.tsx` fetches projects and services from Supabase at render. If Supabase is slow, the entire page stalls. Add Suspense boundaries around `<Works>` and `<Contact>` with skeleton fallbacks so the hero and nav paint immediately while data loads.

### 0.5 Font flash on first load [P2]
Amiri is preloaded but Fraunces and Space Mono are loaded via `next/font`. Until they're ready, the system font shows briefly. Add `font-display: optional` to reduce layout shift, or use `font-display: swap` with skeleton-text placeholders in the hero.

### 0.6 `<img>` tag in Nav instead of `next/image` [P2]
`Nav.tsx` uses a raw `<img>` tag for the logo (noted by eslint-disable comment). Replace with `next/image` with `priority` to ensure LCP isn't delayed by the logo.

### 0.7 No error boundary around sections [P2]
If any section throws (e.g. Supabase query fails), the whole page crashes to `error.tsx`. Each data-dependent section should have its own `<Suspense>` + `<ErrorBoundary>` so one failure doesn't blank the whole page.

### 0.8 `z-index: 300` on Nav — undocumented [P3]
Nav uses `z-300` (Tailwind v4 arbitrary class). This works but isn't part of a documented z-index scale. Create a `Z_LAYERS` constant and use it consistently.

---

## 1. Navigation

### Desktop (1024px+)

**1.D1 [P1] Nav "Contact →" has an arrow but no hover effect**
The contact CTA button in the nav has `transition: 'border-color .25s, color .25s'` but no visible hover state change — the border color transitions to the same value. Add a background fill on hover:
```css
/* When hovered: */
border-color: var(--text);
background: var(--text);
color: var(--bg);
```

**1.D2 [P2] No active/current section indicator**
None of the nav links show which section the user is in. Add an IntersectionObserver that adds an `active` class to the current section's nav link. Use a 2px underline or a subtle accent-color dot rather than font-weight (weight causes layout shift).

**1.D3 [P2] Magnetic effect cleanup — memory leak potential**
`Nav.tsx` registers mouse listeners on each nav item inside a `useEffect` but the inner return in `forEach` doesn't work as intended. The cleanup function returned inside `.forEach()` is ignored — only the outer `useEffect` cleanup runs. Rewrite to collect all elements and cleanup properly:
```ts
const cleanups: (() => void)[] = []
nav.querySelectorAll<HTMLElement>('[data-magnetic-btn]').forEach(el => {
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)
  cleanups.push(() => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  })
})
return () => cleanups.forEach(fn => fn())
```

**1.D4 [P3] No visual feedback on nav link hover**
`nav-link` elements have `transition: 'color .25s'` but the hover color isn't set in CSS. They don't visually respond to hover at all. Add:
```css
.nav-link:hover { color: var(--accent); }
```

### Tablet (768px - 1023px)

**1.T1 [P1] No mobile/tablet menu**
At `max-width: 900px`, the CSS hides all nav links except the Contact CTA. So on tablet/mobile, users can only navigate to Contact — there is no way to reach Capabilities or Works via the nav. **This is a navigation blackout.** Options:
- **Recommended:** Hamburger menu that opens a full-screen overlay. Clean, consistent with the brand aesthetic.
- Alternatively: keep all 3 links but reduce font size and gap to fit.

The hamburger overlay approach:
```tsx
// State: const [menuOpen, setMenuOpen] = useState(false)
// Button: a ☰ / × toggle, aria-expanded
// Overlay: fixed inset-0 z-[290] bg-[var(--bg)] flex flex-col items-start justify-center px-8
//          gap-8 — links at clamp(32px, 6vw, 56px) Fraunces weight-300
// Close on link click
```

**1.T2 [P2] Brand name font changes on tablet**
At 900px the brand name switches from mono to Fraunces 800 weight via an `!important` override. This is a noticeable font-family jump as you resize. Either: keep mono always, or add a smooth crossfade.

### Mobile (< 768px)

**1.M1 [P1] Same as 1.T1 — hamburger menu needed on mobile**
Priority is higher on mobile. Users cannot navigate to any section except Contact.

**1.M2 [P2] Nav padding is 18px 24px — adequate, but logo + CTA may be tight at 320px**
Test at 320px (older iPhones). If the logo + "Contact →" CTA don't fit on one line without wrapping, reduce the CTA to just an arrow or icon.

---

## 2. Hero Section

### Desktop (1024px+)

**2.D1 [P2] Scroll indicator says "Scroll" — violates the CLAUDE.md scroll-cue ban**
The scroll indicator has a text label "Scroll" with a vertical animated scanner. This was flagged as a banned pattern in the design rules. The animated scanner track alone is sufficient visual cue. Remove the "Scroll" text label, keep only the scanner track.

**2.D2 [P2] Scramble animation fires on every hot-reload in dev**
The scramble effect re-fires whenever `headlineEn` changes (which happens on every RSC rerender in dev). This is normal behaviour but can feel jittery. Not a production issue — note for dev ergonomics only.

**2.D3 [P2] `init-btn` pulse animation fights with hover**
`btn-pulse` animation runs indefinitely and uses `box-shadow`. On hover, `animation: none` is set to stop it. But the cancel is abrupt — the box-shadow jumps. Add a transition:
```css
.init-btn { transition: box-shadow .3s ease; }
```

**2.D4 [P3] Hero Arabic headline has `paddingTop: '0.45em'` compensation — fragile**
The diacritic clearance hack using `paddingTop + marginTop` is working but depends on a fixed `0.45em` offset. If the Arabic font size changes, this will clip. Use `overflow: visible` on the `h1` wrapper and let the diacritics overflow naturally, relying on section padding for clearance instead.

**2.D5 [P3] `opacity: 0` CTAs with CSS animation — invisible if JS disabled**
All hero elements use `animation: fade-up ... forwards` which starts at `opacity: 0`. If CSS animations are disabled (some corporate browsers), everything stays invisible. Add a `@media print, (prefers-reduced-motion)` rule that sets `opacity: 1; transform: none` on all `.h-line`, `.hero-ctas`, `.hero-grid`, `.scroll-indicator` elements.

The reduced-motion rule already exists but covers `animation-duration: 0.01ms` rather than making the end state visible immediately. The `reduce` branch sets `animation: none` but doesn't set the starting opacity. Fix in each component:
```tsx
// If reduced, don't use opacity:0 as initial — use opacity:1
opacity: reduced ? 1 : 0,
animation: reduced ? 'none' : 'fade-up 1s ease 1.3s forwards',
```

This is the most impactful accessibility fix for the hero.

### Tablet (768px - 1023px)

**2.T1 [P1] Arabic headline clips at ~820px viewport**
At 820px wide, `clamp(85px, 15vw, 150px)` resolves to ~123px for the Arabic. The Arabic word "أنظمة تُفكّر" is two words that become a single long string. On tablet it can overflow the right edge. The `direction: rtl; text-align: right` means it flows right-to-left, potentially off-screen left.

**Fix:** Add `word-break: break-word` and test; or tighten the `clamp` max for the 900px-and-below range:
```css
@media (max-width: 900px) {
  .h-line-ar { font-size: clamp(68px, 16vw, 110px) !important; }
}
```

**2.T2 [P2] Hero padding at 900px is `100px 24px 80px` — top padding may push headline too low**
At tablet, 100px top padding + 64px nav = 164px before the first content pixel. On a 768px tall tablet, this leaves ~600px for content. Check that the full hero (headline + grid + CTAs + scroll indicator) fits without overflow.

**2.T3 [P2] Arabic subtext (`hero-grid-ar`) is hidden at 900px — bilingual value lost on mobile**
The Arabic subtext column disappears on tablet/mobile, leaving only English. Since the brand is Qatar-based with Arabic as a primary language, this is a significant brand gap. Consider showing a condensed single line of Arabic text on mobile rather than hiding entirely.

### Mobile (< 768px)

**2.M1 [P1] CTAs go `flex-direction: column; align-items: stretch` — buttons become full-width**
This is correct behaviour but the "WhatsApp Us" secondary button at full width on mobile looks heavy. Apply an asymmetric treatment: primary CTA full-width, secondary CTA auto-width centered, or give the secondary a border-only style with less visual weight.

**2.M2 [P2] At 480px, `h-line-ar` is `clamp(68px, 19vw, 110px)` — at 320px this is ~61px**
At 320px the Arabic is 61px and takes 2-3 lines. The `paddingTop + overflow: hidden` clip wraps may not account for multi-line. Test on real 320px device or simulator.

**2.M3 [P2] Scroll indicator on mobile sits below CTAs in normal flow**
This is intentional (changed from `position: absolute` to normal flow). But the combined height of headline + subtext + CTAs + scroll indicator may push content below the viewport fold on short phones (812px height iPhone SE). Add a height check:
```css
@media (max-width: 480px) and (max-height: 700px) {
  .scroll-indicator { display: none !important; }
}
```

**2.M4 [P3] OrbitalWidget hides at 900px — hero right side is empty on desktop-ish tablets**
Between 900px and 1024px, the OrbitalWidget is hidden, leaving the right third of the hero completely empty. Either extend the hide breakpoint to 1024px, or add a decorative element (a single dashed ring, the Nous logomark) for the 900-1024px range.

---

## 3. Capabilities Section

### Desktop (1024px+)

**3.D1 [P2] Orbit viewport is `width: 460px; height: 460px` fixed — on 1100px screens this is cramped**
At exactly 1100px wide, the cap grid is `1fr 360px` — the orbit is forced to 360px but the CSS overrides are in a `769px-1100px` media query. At 1101px the orbit snaps back to 460px which may overflow into the content. Add a `min-width: 0` on the orbit column to prevent overflow.

**3.D2 [P2] Orbit center label (`#orbit-center-lbl`) is positioned absolute but its content is JS-driven**
If JS is slow or fails, the center label stays empty — the orbit shows but with no inner context. Add a default state with "Hover a service" text that JS replaces on first activation.

**3.D3 [P2] `svc-name` uses `clamp(13px, 1.5vw, 20px)` — at 1024px this resolves to ~15px**
15px Fraunces weight-300 is fine on desktop but feels small at 1024px. Bump the minimum: `clamp(15px, 1.5vw, 20px)`.

**3.D4 [P3] Horizontal scroll appears on the capabilities section if orbit overflows**
The orbit at 460px + service list + 40px padding each side = can exceed viewport at ~1000px. The section has no `overflow: hidden`. Add `overflow-x: clip` on the section element.

**3.D5 [P3] "Tech Stack Orbits" label below the orbit — violates the No-Eyebrow pattern**
The label `— Tech Stack Orbits —` is a decorative text strip below the orbit. This is fine as a contextual label, but the em-dash format (`—`) violates the em-dash ban. Change to `/ Tech Stack Orbits /` or `Tech Stack Orbits` without dashes.

### Tablet (768px - 1023px)

**3.T1 [P1] Orbit hides at 900px but accordion expand hint is also hidden**
When the orbit disappears, the `.caps-hint` also hides. But on tablet, users have no indication that services are interactive. The `.tap-hint` ("Tap to explore") is the only cue — ensure it's visible. Currently, `.tap-hint { display: none }` by default and is shown only in the mobile accordion CSS. Confirm the show-rule fires correctly at 900px.

**3.T2 [P2] No tablet-specific layout between 900px and 1100px**
The `769px-1100px` query shows a 1fr+360px grid still — meaning a 360px orbit is still shown at 900-1100px. But the mobile query at 900px hides the orbit entirely. There's a conflict: 769-900px has `1fr 360px` grid but orbit-vp-wrap is hidden. This leaves a ghost empty column. Force `grid-template-columns: 1fr` at 900px too.

**3.T3 [P2] Tap-to-expand accordion: only one item can be open at a time**
This is good UX, but there's no close-all affordance. Add a subtle "close" tap behavior — tapping an open item again should close it.

### Mobile (< 768px)

**3.M1 [P1] Arabic service names (`svc-name-ar`) hide when accordion opens**
When `.acc-open .svc-name-ar { display: none }` fires, the Arabic label disappears abruptly (no transition) as the pills appear. Use `opacity: 0` + `max-height: 0` transition instead of `display: none` for a smooth cross-fade.

**3.M2 [P2] Service category tag (`.svc-cat`) at mobile: font-size forced to 9px**
The category tag is readable but `9px` mono is at the edge of legibility on mobile. Bump to `10px` minimum.

**3.M3 [P2] Capabilities section top padding at 480px is `56px 20px` — with a 64px nav, this means 120px before first content**
That's fine for section feel but verify the eyebrow + headline + first service row are all visible above the fold on a 667px-height phone (iPhone SE 2).

**3.M4 [P3] Tech pills accordion on mobile: `max-height: 500px` transition**
The `max-height` CSS transition for the pills accordion is `500px` which is fine for a few pills but creates a delay on items with many pills (the animation runs to 500px even if content is 80px). Use CSS Grid rows trick instead:
```css
.mob-pills { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .4s ease; }
.mob-pills.open { grid-template-rows: 1fr; }
.mob-pills > div { overflow: hidden; } /* inner wrapper needed */
```

---

## 4. Works Section

### Desktop (1024px+)

**4.D1 [P1] 3-column grid with `min-height: 480px` — empty project slots create blank cards**
If the admin has 1 or 2 projects, the 3-column grid shows a 1 or 2-card layout with the third slot empty. If projects array is empty, the section renders a header with no cards. Add:
- Empty state: a single full-width card with "Projects coming soon" or a decorative placeholder
- For 1-2 projects: either force a different grid or visually fill the gap

**4.D2 [P2] 3D tilt card uses `requestAnimationFrame` without `will-change`**
The card tilt lerp uses `raf` every frame. Without `will-change: transform`, the browser can't promote the layer. Add `will-change: transform` to the card style. Remove it on `mouseleave` after the animation settles.

**4.D3 [P2] Card `content` area has `background: linear-gradient(to top, rgba(255,255,255,.97)...)`**
This gradient assumes a white/light card background. On the card, the actual background is `var(--bg2)` which is `#FFFFFF`. If the design ever goes dark mode, this hardcoded white will break. Use `rgba(var(--bg2-rgb), .97)` or a `var(--bg2)` token.

**4.D4 [P2] Section eyebrow `[ 003 — SELECTED WORKS ]` has TWO banned patterns**
- `003` prefix — numbered eyebrow (banned in design rules)
- `—` em-dash (banned)

Change to: `[ SELECTED WORKS ]` or remove the eyebrow entirely (the h2 "Digital Masterpieces" is sufficient).

**4.D5 [P3] Card line (`.card-line`) only expands on hover — no focus state**
Keyboard users tabbing to/through the cards get no visual feedback. Cards need `tabindex="0"` and `:focus-visible` styles matching the hover state.

**4.D6 [P3] Works section top padding is `40px` — much less than other sections**
Capabilities has 64-80px, Contact has more. At 40px top padding, the Works section header feels cramped after scrolling past Capabilities. Use `80px 56px` to match the rhythm.

### Tablet (768px - 1023px)

**4.T1 [P1] At 900px, grid becomes `1fr` (single column) — cards stack vertically**
Single column with `min-height: 220px` per card is fine for content, but the 3D tilt effect is mouse-only so it's disabled on touch. On tablet, the card bottom gradient + content layout (`position: absolute bottom-0`) with `min-height: 220px` may cut off the description text if it's longer than 2 lines.

**Fix:** At mobile, the CSS changes `card-content` to `position: relative` which solves this. Verify this also fires at the 900px breakpoint and not just 480px.

**4.T2 [P2] Grid gap reduces to `16px` at 900px — still reasonable but test with images**
If project images are tall (e.g. 16:9 aspect), cards at 220px min-height will crop aggressively. Consider adding `aspect-ratio: 16/9` on the card image container to maintain proportions.

### Mobile (< 768px)

**4.M1 [P2] Card tags at mobile: many tags can overflow the card width**
Tags use `flex-wrap: wrap` which is correct, but at 320px width with 6+ tags, this creates a tall multi-row strip before the headline. Limit visible tags to 2-3 on mobile with a `+N more` indicator.

**4.M2 [P2] Card Arabic project name: `font-size: 0.65em` of the parent `clamp(17px, 2.1vw, 28px)`**
At mobile, parent resolves to 17px, so Arabic becomes ~11px. This is too small to read comfortably. Set a mobile-specific floor: `max(12px, 0.65em)`.

**4.M3 [P3] No swipe-to-navigate on mobile card stack**
On mobile, the cards stack vertically which requires scrolling. A horizontal scroll-snap carousel would make the section feel more native on mobile. Consider wrapping in a scroll-snap container for mobile only.

---

## 5. Contact Section

### Desktop (1024px+)

**5.D1 [P1] Form inputs are `font-size: clamp(22px, 3vw, 36px)` — at 36px, the name input is huge**
This display-sized input is visually dramatic but: (a) on Safari, inputs don't scale below `16px` to prevent auto-zoom, but at 36px the form takes significant vertical space. The email input at 36px makes the form feel like a full-page poem rather than a contact form. Consider capping at `clamp(20px, 2.5vw, 28px)` for a better balance.

**5.D2 [P1] Emoji flags in country code select**
The `COUNTRY_CODES` array uses emoji flags (`🇶🇦`, `🇸🇦`, etc.) in a native `<select>`. This is fine on macOS/iOS but on Windows 10 and older Android, emoji flags render as letter pairs (`QA`, `SA`) instead of flag images. This looks broken and confusing.

**Fix:** Remove flags from the select, show only `+974 QA`, `+966 SA`, etc. Or replace the native select with a custom dropdown that uses SVG flag icons from `flag-icons` CSS library.

**5.D3 [P2] Service selection pills have no keyboard navigation**
The service pills are `<button>` elements with `aria-pressed` which is correct. But there is no `aria-describedby` pointing to an instruction. Add a visually-hidden description: "Select one or more services you're interested in."

**5.D4 [P2] Phone field: `countryCode` state is only appended on submit — no visual confirmation**
The user selects `+974` from the dropdown but the text input doesn't show the code as a prefix. The layout shows them side by side but they're separate fields with no visual binding. Add a visual connector: a thin vertical separator between the select and input, and ensure the select + input have the same border-bottom style.

**5.D5 [P2] Progress indicator `pct` is calculated but only used in the submit button color**
There's a percentage state (`pct: 0-100`) computed but only the `isReady` boolean drives the button enable state. The form doesn't show a progress bar or visual progress to the user. Consider showing the 4 step dots (filled = complete) above the submit section, which mirrors the step UI that already exists.

**5.D6 [P3] "Something went wrong. Please email us directly." error message doesn't include the email**
The error text says to email them "directly" but doesn't show the `contactEmail` prop value. Change to:
```tsx
setError(`Something went wrong. Please email us directly at ${contactEmail}.`)
```

**5.D7 [P3] Form auto-clears on success (5-second timer)**
After submit, form state clears immediately while the success state is shown. If the user refreshes within 5 seconds (common to verify submission), the form is blank. Don't clear the form data until `submitted` times out and resets. Or: keep data in the fields but disable them, show "Sent!" overlay on top.

### Tablet (768px - 1023px)

**5.T1 [P1] Contact section layout is unknown at tablet — no explicit tablet breakpoint exists**
The contact section has no `@media (min-width: 768px) and (max-width: 1023px)` rules. At 900px it may inherit from the 900px global breakpoint but the internal form layout (steps sidebar + form fields + brief panel) may overflow. Audit the two-column layout at 900px.

**5.T2 [P2] Service pills grid at tablet may overflow**
The service pills use `display: grid; grid-template-columns: repeat(auto-fill, ...)` (or similar). At 900px the pills container may force an extra row with 1 item on the last line. Add explicit column count for tablet.

### Mobile (< 768px)

**5.M1 [P1] Phone field country code select + input at 320px**
At 320px, a `<select>` + text `<input>` side by side will be cramped. The select at minimum is ~80px wide, leaving ~224px for the phone number input. Test this layout and add `flex-wrap: wrap` if needed, with the select taking full width first and input below.

**5.M2 [P1] Text inputs at `clamp(22px, 3vw, 36px)` — at 375px, 3vw = 11.25px**
Wait — `clamp(22px, 3vw, 36px)` on mobile: 3vw at 375px = 11.25px, but `clamp` floors at 22px. So inputs stay at 22px on mobile. **This is actually correct.** But the `<textarea>` / message field should have a `min-height: 120px` to prevent a single-line textarea that users can't easily type in.

**5.M3 [P2] "Not Sure Yet" service pill — at mobile with many services, the pills grid may become a wall**
6+ service pills + "Not Sure Yet" in a `flex-wrap` container can become 4+ rows at mobile. This pushes the form fields off-screen and requires more scrolling than expected. Add a horizontal scroll-snap to the pills container on mobile, or reduce to 2 columns.

**5.M4 [P2] Form step numbers (decorative `aria-hidden` spans) — at mobile these add visual clutter**
The small step numbers in the corner of each step add cognitive overhead at small sizes. Consider hiding them at 480px and below.

---

## 6. Footer Section

The footer currently has three elements: wordmark (left), rotating badge (center), legal text (right).

### 6.1 Critical Issues [P1]

**6.1.A No navigation links**
The footer has zero links except the implied logo click. Users who reach the footer and want to jump to Capabilities or Contact have no quick path. At minimum add:
```
Capabilities  ·  Proof  ·  Contact
```
as a single horizontal row in small mono type above the wordmark row.

**6.1.B No contact information**
Qatar-based agency with no email, phone, or WhatsApp in the footer. Clients who scroll to the bottom looking for "how to reach them" find nothing. Add `nouslab@icould.com` and the WhatsApp number in the footer.

**6.1.C No social links**
No LinkedIn, Instagram, Behance, or X link anywhere on the page — not in the footer, not in the nav, not in the hero. Even one link (LinkedIn) establishes credibility. Add to footer.

**6.1.D Logo uses `mixBlendMode: 'multiply'` which fails in dark sections**
If the footer background ever becomes dark, `blend-mode: multiply` makes the logo invisible. Remove the blend mode or swap to `normal` — the logo SVG is already green/dark and works on a light background natively.

**6.1.E Rotating badge text says "AN NOUS MASTERPIECE ✦ AN NOUS MASTERPIECE ✦"**
"AN NOUS" is grammatically wrong. Either "A NOUS MASTERPIECE" or "BY NOUS ✦ BY NOUS ✦" or "NOUS.QA ✦ NOUS.QA ✦". Fix the copy.

### 6.2 Quality Issues [P2]

**6.2.A Mobile layout: `flex-wrap` on the three items collapses badly**
At 480px, the three items (wordmark + badge + legal) with `flex-wrap` and `gap: 20` will stack vertically. The rotating badge in the middle creates an awkward order: logo → badge → legal. On mobile, the badge should be last (or hidden), with logo + legal on the top row, and navigation links filling the middle.

Proposed mobile footer layout:
```
[ Nous logo ]        nouslab@icould.com
─────────────────────────────────
Capabilities · Proof · Contact
─────────────────────────────────
© 2025 Nous. All Rights Reserved.  [ rotating badge, smaller, floated right ]
```

**6.2.B No `aria-label` on footer landmark**
The `<footer>` element has no `aria-label`. Screen readers announce it as "contentinfo" which is correct, but adding `aria-label="Site footer"` improves navigation for screen reader users.

**6.2.C Copyright year is hardcoded as "2025"**
Change to dynamic: `© {new Date().getFullYear()} Nous.`

**6.2.D Location text "Qatar · 2025" repeats the year — the copyright already has 2025**
Remove the year from the location string. Change to just "Doha, Qatar" or "نوس · الدوحة، قطر" (bilingual).

**6.2.E `mixBlendMode: 'multiply'` + `opacity: .7` on logo makes it illegible at small sizes**
At 32px with 70% opacity and multiply blend mode, the logo is barely visible. Either remove the opacity + blend, or increase size to 40px.

**6.2.F Em-dash not used here, but the middle-dot `·` separator in "Qatar · 2025" is fine**
One `·` per line is within the 1-per-line ration. Keep.

### 6.3 Enhancement Suggestions [P3]

**6.3.A Add a "Back to top" button**
A subtle upward arrow anchored to `#` on the right side of the footer (or overlapping it). Smooth-scrolls to the top. Standard UX that reduces back-button dependence.

**6.3.B Make the rotating badge the CTA anchor**
The center badge is purely decorative. Make it a link: `<a href="/contact">`. On hover, slow the rotation to 0 (pause) and show "Start a project →" text in the center instead of the accent dot. This turns dead decoration into a conversion touchpoint.

**6.3.C Add a tagline below the wordmark**
"Engineered Intelligence." or "Intelligence, engineered." (the OG image copy) as a 1-line mono caption below the wordmark. This makes the footer feel complete rather than sparse.

**6.3.D Consider a pre-footer CTA strip**
A full-width dark or accent-green band just above the footer with a large headline "Ready to build something remarkable?" and a single CTA. Common on agency sites, converts well for users who scrolled all the way down.

---

## 7. Performance

### 7.1 Image Optimization [P1]

**Works cards: `next/image` with `fill` and no explicit `priority`**
The first Works card is likely above the fold on many desktop resolutions. Add `priority` to the first card (index === 0):
```tsx
<Image ... priority={index === 0} />
```

**Orbital Widget SVG is inline, 6KB+**
The Nous logo SVG in the OrbitalWidget is embedded as inline JSX with many path elements. This is fine for one instance but adds to the initial parse time. Externalize to `/nous-logo-orbital.svg` and use `<img>` or `next/image`.

### 7.2 Animation Performance [P2]

**`requestAnimationFrame` loops that never stop**
`OrbitalWidget.tsx` runs a `requestAnimationFrame` loop indefinitely even when the element is off-screen. Add an IntersectionObserver to pause the raf loop when out of view:
```ts
const io = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) { raf = requestAnimationFrame(tick) }
  else { cancelAnimationFrame(raf); raf = 0 }
})
io.observe(el)
```

**Works card tilt: raf loop runs even when not hovering**
The tilt lerp runs until `Math.abs(crx) < 0.01` which works but could run for 30+ frames after mouseleave on a fast machine. This is acceptable but add `raf = 0` when stopping to prevent double-start.

### 7.3 Bundle Size [P2]

**`motion/react` is loaded on the root layout**
`WebVitals.tsx`, `Cursor.tsx`, and several sections import from `motion/react`. Because the cursor is on every page and mounted in the root layout, the full motion bundle is always loaded. This is unavoidable given the cursor, but lazy-load the section-level motion (Capabilities, Works) via dynamic imports:
```ts
const Capabilities = dynamic(() => import('@/sections/capabilities/Capabilities'), { ssr: false })
```

---

## 8. Suggested New Elements / Missing Sections

### 8.1 "About / Who We Are" mini-section [P2]
There's no section between Capabilities and Works that explains who Nous is. A 2-paragraph brand statement (in both English and Arabic) between these sections would improve conversion. Keep it minimal: one column, Fraunces display, no card. 3-4 sentences max.

### 8.2 Testimonials / Social proof [P2]
No testimonials exist anywhere on the page. For a new agency, even 2-3 client quotes add significant trust. A simple horizontal scroll of 3 quote cards (name + role + 2-line quote) would work between Works and Contact.

### 8.3 Process / How we work [P3]
A 3-step "How it works" section (Brief → Design → Launch) with a short description per step. Avoids the numbered stage pattern (banned) by using verb-noun labels. Supports conversion by reducing uncertainty.

### 8.4 Language toggle (EN / AR) [P3]
The site mixes Arabic and English throughout but doesn't offer a full Arabic experience. A language toggle in the nav (small `EN | AR` switch) that swaps the entire page text would be high-impact for the Qatar market. Requires `next-intl` or `i18next` — a larger sprint.

---

## 9. Checklist Summary

### Ship-blockers (must fix before launch)
- [ ] Nav: hamburger menu for mobile/tablet (no way to navigate)
- [ ] Contact: emoji flags in select break on Windows
- [ ] Footer: no contact info, no nav links, no social links
- [ ] Footer: "AN NOUS" grammatically wrong
- [ ] Hero: `opacity:0` initial state with no reduced-motion fallback makes elements invisible
- [ ] Works: empty state when 0 or 1 projects
- [ ] Cursor: no fallback — body stays `cursor:none` if JS fails

### Quality (fix before any soft launch)
- [ ] Nav: active section indicator
- [ ] Nav: magnetic cleanup memory leak fix
- [ ] Nav: Contact button hover state
- [ ] Hero: remove "Scroll" text label
- [ ] Hero: Arabic subtext hidden on mobile — show condensed version
- [ ] Capabilities: orbit center label default state
- [ ] Capabilities: em-dash in "Tech Stack Orbits" label → remove dashes
- [ ] Works: remove numbered eyebrow `003` prefix and em-dash
- [ ] Works: `will-change: transform` on tilt cards
- [ ] Works: section top padding 40px → 80px
- [ ] Contact: `setError` show contact email in message
- [ ] Contact: phone field visual binding (select + input connected)
- [ ] Footer: dynamic copyright year
- [ ] Footer: remove duplicate year from location string
- [ ] Footer: mobile layout restructure
- [ ] Footer: `aria-label` on footer element
- [ ] Footer: logo opacity/blend mode fix
- [ ] Performance: `priority` on first Works card

### Enhancements (next sprint)
- [ ] Footer: pre-footer CTA strip
- [ ] Footer: rotating badge as contact link
- [ ] Footer: back-to-top button
- [ ] Footer: tagline below wordmark
- [ ] Social proof / testimonials section
- [ ] About mini-section
- [ ] Works: swipe carousel on mobile
- [ ] Language toggle (full Arabic site)
- [ ] About / mini-bio section
