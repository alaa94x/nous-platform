# Nous — Wave 4 Completion & Website Elevation Plan

> **Implementation status — completed 13 July 2026.** The research-led sprints, public and admin changes, English/Arabic responsive verification, and production checks are complete. See `NOUS_REDESIGN_IMPLEMENTATION_REPORT.md` for the implementation evidence and launch checklist.

Date: 13 July 2026  
Scope: public website, shared UI components, English/Arabic experience, responsive behavior, and purposeful motion

## 1. Audit conclusion

Wave 4 is not implemented.

The stakeholder brief defines Wave 4 as:

1. Real `/ar` pages.
2. An `EN / ع` language toggle.
3. English and Arabic content separated instead of shown together.
4. A full mobile pass based on one message per screen.
5. Larger mobile targets and a persistent project CTA.

The current site still has these gaps:

- `/ar` returns the custom 404 page.
- `layout.tsx` advertises `/ar` through `hreflang` even though the route does not exist.
- There is no language switcher in desktop or mobile navigation.
- The hero, About, Capabilities, service pages, and project pages show English and Arabic simultaneously.
- The mobile bottom rail contains navigation, but it is not the stakeholder brief's prominent sticky “Start Your Build” action.
- Mobile sections are responsive reductions of desktop sections rather than a consistent “one message per screen” system.

Wave 3 is partially complete. The current WebGL fluid is distinctive and interactive, but the brief's recommended “Assembly” concept is used only as a fallback rather than the main signature animation. This should be treated as a deliberate creative decision, not an unnoticed mismatch.

## 2. Current experience: before and after

| Before | After | Why |
| --- | --- | --- |
| English and Arabic appear together across most pages | One language per route with an `EN / ع` path-preserving toggle | Reduces cognitive load and finishes Wave 4 correctly |
| `/ar` is declared in metadata but returns 404 | Complete Arabic homepage, contact, services, and case studies | Makes `hreflang` truthful and creates indexable Arabic content |
| Desktop layouts are mostly stacked grids with uniform dividers | Each section receives one signature interaction tied to its meaning | Creates rhythm without turning the site into an animation demo |
| Mobile rail has three equal navigation destinations | Navigation plus a visually dominant sticky “Start Your Build” action | Keeps conversion within thumb reach |
| Mobile About presents the full English block followed by the full Arabic block | Concise localized copy, one statement and one proof point per screen | Removes the largest source of mobile clutter |
| Capabilities becomes a dense accordion on mobile | Touch-first service cards with progressive disclosure and clear 48px targets | Improves scanning and makes interactions feel intentional |
| Process is a static four-column timeline | A progress line advances as each phase becomes active | Motion explains sequence instead of decorating it |
| Testimonials are three static columns | Desktop focus states and a swipeable mobile snap rail | Gives social proof movement and better mobile legibility |
| FAQ is an always-expanded grid with an empty sixth cell | Accessible animated accordion with one answer open at a time | Removes the blank box and shortens the page |
| Service and case-study heroes contain large empty areas | Editorial media, contextual motion, and clearer next actions above the fold | Increases visual storytelling and perceived completeness |
| General `.reveal` applies the same fade-up everywhere | Small set of named reveal patterns selected by content type | Avoids repetitive motion and improves design coherence |
| Some interactive transitions use `all` or long generic timing | Explicit transform/opacity/color transitions with shared easing tokens | Improves responsiveness and animation performance |

## 3. Design direction

The site should feel like a living technical instrument: precise, calm, and responsive.

Motion rules:

- Motion must communicate sequence, state, depth, or feedback.
- Background motion is slow and ambient; interface feedback is fast.
- Repeated interactions stay under 240ms.
- Scroll entrances use strong ease-out curves and play once.
- Continuous motion uses only `transform` and `opacity` where possible.
- Hover-only ideas must have a touch equivalent.
- Reduced-motion mode keeps hierarchy and state changes without spatial movement.
- No bouncing cards, universal parallax, or animation on every paragraph.

Recommended shared tokens:

```css
:root {
  --ease-out: cubic-bezier(.23, 1, .32, 1);
  --ease-in-out: cubic-bezier(.77, 0, .175, 1);
  --ease-drawer: cubic-bezier(.32, .72, 0, 1);
  --motion-fast: 140ms;
  --motion-ui: 200ms;
  --motion-reveal: 720ms;
  --motion-section: 1000ms;
}
```

## 4. Wave 4A — localization architecture

Priority: critical  
Estimate: 3–4 days

### Route system

Keep the existing English URLs canonical and add mirrored Arabic routes:

```text
/
/contact
/services/ai
/services/full-stack
/services/mobile
/services/ecommerce
/services/cloud
/services/design
/work/[slug]

/ar
/ar/contact
/ar/services/ai
/ar/services/full-stack
/ar/services/mobile
/ar/services/ecommerce
/ar/services/cloud
/ar/services/design
/ar/work/[slug]
```

Use shared page builders rather than copying page markup. Each route supplies `locale: 'en' | 'ar'` and a locale dictionary.

### Content system

Create:

- `src/i18n/config.ts` for supported locales and path helpers.
- `src/i18n/en.ts` and `src/i18n/ar.ts` for interface copy.
- `src/i18n/getDictionary.ts` for typed dictionary access.
- `src/components/language/LanguageSwitch.tsx` for the route-preserving toggle.
- Locale-aware page-level metadata helpers.

CMS/database work:

- Add Arabic equivalents for every public setting, testimonial, service description, case-study summary, challenge, solution, result label, and CTA.
- Define explicit fallback policy: unpublished Arabic content should hide the page or use a reviewed Arabic fallback; it should never silently insert English into an Arabic paragraph.
- Add a translation-completeness flag in admin.

### Document direction and metadata

- English pages render `lang="en" dir="ltr"`.
- Arabic pages render `lang="ar" dir="rtl"`.
- Generate reciprocal canonical and alternate links per route.
- Add Arabic Open Graph locale and localized titles/descriptions.
- Include Arabic routes in the sitemap only after the content exists.
- Localize JSON-LD visible strings and FAQ data.

### Language switch behavior

- Desktop: compact `EN / ع` control beside the primary CTA.
- Mobile: place the toggle in the logo/header area, not inside the bottom rail.
- Preserve the current page when switching languages.
- Keep the control instant; only the page navigation should change.
- Give the switch an explicit accessible label such as “عرض الموقع بالعربية.”

### Acceptance criteria

- Every English public URL has a working Arabic equivalent.
- `/ar` no longer returns 404.
- No homepage or service-page section shows both full languages simultaneously.
- Arabic pages pass RTL visual inspection at 390px, 768px, and 1440px.
- Canonical, `hreflang`, sitemap, and Open Graph metadata agree.

## 5. Wave 4B — mobile experience redesign

Priority: critical  
Estimate: 3–4 days

### Global mobile shell

- Replace the current passive contact tab with a dominant lime “Start” action or a compact floating CTA immediately above the rail.
- Keep minimum touch targets at 48×48px.
- Account for `env(safe-area-inset-bottom)` everywhere.
- Use a consistent 20px side gutter and a 72–96px section rhythm.
- Introduce a compact section progress cue so the long homepage does not feel endless.
- Do not hide essential content solely to force one viewport; shorten and prioritize copy instead.

### Mobile content rule

Each viewport should answer one primary question:

1. Hero — what Nous does.
2. Who We Are — why the team is credible.
3. What We Build — which service fits.
4. Our DNA — how the engagement works.
5. Selected Work — what has been delivered.
6. Nous Circle — who trusts Nous.
7. FAQ — remove the last objection.
8. Start Your Build — act now.

### Mobile-specific component changes

- Hero: localized single-language copy, one primary CTA, quieter secondary action.
- About: one strong statement followed by two short trust points; no duplicated language block.
- Capabilities: show service name, plain subtitle, and icon before expansion; open one item at a time.
- Our DNA: vertical active-step timeline; the progress line fills as the user scrolls.
- Work: horizontal snap carousel or one large card per screen; reveal the next card edge to indicate movement.
- Testimonials: swipeable snap cards with pagination dots and no auto-advance.
- FAQ: accordion with large question targets and animated answer height.
- Contact form: one logical group per step on narrow phones; keep the completion and submit action visible.
- Service pages: single-column deliverables and a sticky inquiry CTA.
- Case studies: bring the project image into the first viewport; collapse optional metrics.

### Acceptance criteria

- No horizontal overflow at 320px, 360px, 390px, 430px, or 768px.
- Primary actions are reachable with one hand and remain above the safe area.
- No section begins with duplicated EN/AR copy.
- Form fields and service selectors remain usable at 320px.
- Landscape mobile does not trap content beneath fixed navigation.

## 6. Wave 5 — motion foundation

Priority: high  
Estimate: 2 days

### Replace the one-size-fits-all reveal

Create a small motion vocabulary:

- `reveal-copy`: 18px vertical travel + opacity.
- `reveal-line`: `scaleX(0 → 1)` from the correct reading origin.
- `reveal-media`: `clip-path` inset reveal with a slight image scale settle.
- `reveal-grid`: parent-controlled 70ms child stagger.
- `reveal-number`: masked number or label entrance.
- `reveal-rtl`: direction-aware entrance for Arabic editorial elements.

Implement through one observer utility with data attributes. Avoid one observer per small component where a section-level observer can control the sequence.

### Interaction feedback

- All pressable controls: `scale(.97)` on active for 120–160ms.
- Cards: border/color/transform only; no `transition: all`.
- Arrow icons: move 2–4px in the direction of navigation.
- Toggles: animate the active indicator, not every label.
- Accordions: transition height/opacity with interruption-safe state changes.
- Form success: brief confirmation morph; never delay the actual submission result.

### Performance budget

- Keep WebGL limited to the hero.
- Lazy-load below-fold interactive visuals.
- Pause canvas and continuous motion offscreen and when the tab is hidden.
- Target no more than two simultaneously running continuous animations below the hero.
- Test with reduced motion and with a simulated low-power mobile profile.

## 7. Wave 6 — section-by-section elevation

Priority: high  
Estimate: 5–7 days

### Navigation

Current issue: clear but conventional; mobile CTA hierarchy is weak.

Enhancements:

- Add the language switch.
- Let the desktop contact control fill with lime on hover while its arrow shifts.
- Animate the active-section underline with `scaleX`.
- On mobile, compress the logo on scroll and promote the sticky Start action.
- Ensure the current section indicator follows all homepage sections, not only Capabilities and Work.

### Hero

Current issue: visually strongest area, but the signature concept differs from the stakeholder's recommended Assembly direction.

Enhancements:

- Decide between two explicit directions:
  - Keep the fluid as the primary Nous signature and rename the creative direction “The Signal.”
  - Promote `AssemblyField` to the primary animation and keep fluid as an optional premium mode.
- Use the same signature frame in the loader and generated Open Graph art.
- Add a very subtle scroll handoff: the grid or signal contracts toward the next section as the hero exits.
- Keep idle motion autonomous and touch-reactive.
- Do not add more floating UI to the hero; it already has sufficient visual density.

### Who We Are

Current issue: two large static text blocks with no proof or progressive emphasis.

Enhancements:

- Localize instead of displaying both languages.
- Reveal the opening sentence as a masked editorial line.
- Add two honest proof markers such as “Senior-led” and “Doha / GCC,” avoiding fabricated metrics.
- Animate a fine connecting rule between statement and proof points.
- Add a restrained portrait/process texture only if authentic studio imagery becomes available.

### What We Build

Current issue: strong desktop orbit, but the mobile accordion is dense and the view-mode switch is visually quiet.

Enhancements:

- Crossfade Business/Engineering descriptions with 2px transition blur.
- Animate the active orbit node with a spring; keep orbit rotation slow.
- Make each service row reveal its plain-language subtitle before tags.
- On mobile, use icon + title + subtitle as the closed state.
- Add a touch preview on first tap and navigate only from the explicit arrow/link.
- Preserve keyboard operation and visible focus.

### Our DNA

Current issue: the four columns describe a sequence but the page does not visually play that sequence.

Enhancements:

- Convert the lime top rule into a scroll-progress line.
- Activate each phase as its midpoint crosses the viewport.
- Bring icons and headings in together; descriptions follow 80ms later.
- On mobile, use a vertical progress spine and one active phase at a time.
- Engagement cards rise by 4px on hover and expose a concise “best for” label.

### Selected Work

Current issue: visually credible, but images are dark and interactions depend heavily on hover.

Enhancements:

- Use a clip reveal as each project enters.
- Add a second project image or close-up that crossfades on hover where assets exist.
- Lift image exposure slightly on hover instead of darkening everything.
- Apply 2–3% pointer parallax only to desktop images, not the full cards.
- On touch, first tap reveals metadata; the explicit arrow opens the project.
- On mobile, use one strong card per screen with snap points.

### Nous Circle

Current issue: three static columns carry equal weight and lack a focal quote.

Enhancements:

- Desktop: highlight one quote at a time based on pointer/focus, with the others softly dimmed.
- Add a slow line progression across the active quote, pausing on hover/focus.
- Mobile: swipeable snap cards, manual only.
- Animate quotation marks or the top rule, not the body copy.

### Get to Know Us

Current issue: five answers in a two-column always-open grid create an empty sixth panel.

Enhancements:

- Replace the grid with a semantic accordion.
- Keep one answer open by default on desktop and all closed on compact mobile.
- Animate answer height and opacity in 200–260ms.
- Rotate the disclosure icon 45°/90° with transform.
- Retain all FAQ content in the initial HTML for SEO.

### Start Your Build CTA

Current issue: good type scale, but the large area is almost completely static.

Enhancements:

- Add a faint ambient signal passing behind the heading every 8–12 seconds.
- Reveal the two heading lines with a mask.
- Give the CTA an immediate press state and a directional arrow response.
- Add a compact trust line: “Reply within 24 hours · Doha, Qatar.”
- On mobile, connect this section visually to the persistent Start action.

### Footer

Current issue: functional and complete, but visually disconnected from the hero signature.

Enhancements:

- Reintroduce a static or extremely slow version of the signature signal near the brand row.
- Reveal footer columns as a single group rather than staggering every link.
- Use underline/arrow feedback for links and press states for contact pills.
- Mirror column order and text alignment on Arabic pages.

## 8. Supporting pages

### Contact form

- Split the mobile form into Name → Contact → Need → Brief rather than exposing the full form at once.
- Animate the completion rail through transforms, not width.
- Give selected services a crisp icon/color transition.
- Move focus to the first invalid field without animating the keyboard-triggered action.
- Keep draft state across accidental navigation.
- Localize validation, country selection, confirmation, and email notifications.

### Service pages

- Add one small service-specific visual system rather than repeating the same empty hero:
  - AI: resolving data constellation.
  - Full stack: connected architecture layers.
  - Mobile: device/gesture path.
  - Commerce: conversion flow.
  - Cloud: resilient node topology.
  - Design: modular composition grid.
- Bring the Arabic title out of the English page after Wave 4.
- Reveal deliverables in grouped rows, not individually.
- Add a contextual selected-work module and a sticky mobile inquiry CTA.

### Case-study pages

- Move the lead image into or immediately below the first viewport.
- Use story chapters: Context → Intervention → Outcome.
- Reveal imagery with clip paths and restrained scale settles.
- Keep metrics optional and never invent them for visual symmetry.
- Add a next-project transition using the next project's dominant color/image.
- Localize titles, summaries, alt text, and project narrative.

### Loading, error, not-found, and offline

- Reuse a lightweight Assembly/Signal motif so utility states feel intentional.
- Never gate first content behind a long loader.
- Keep error actions immediate and obvious.
- Localize the Arabic versions of every state.

## 9. Implementation order

### Sprint 1 — finish Wave 4 foundations

1. Locale config, dictionaries, and route helpers.
2. `/ar` homepage and global Arabic document direction.
3. Language toggle in desktop and mobile navigation.
4. Localized metadata, sitemap, canonical, and `hreflang`.
5. Remove duplicated bilingual blocks from English routes.

### Sprint 2 — finish Wave 4 coverage

1. Arabic contact flow.
2. Arabic service pages.
3. Arabic case-study pages.
4. Admin translation completeness.
5. Full mobile shell and sticky CTA.

### Sprint 3 — motion system

1. Shared motion tokens.
2. Replace generic reveal behavior.
3. Normalize button/card/toggle feedback.
4. Add reduced-motion and performance tests.

### Sprint 4 — homepage elevation

1. About and Our DNA.
2. Capabilities mobile interaction.
3. Work card media motion.
4. Testimonials and FAQ transformation.
5. CTA/footer signature handoff.

### Sprint 5 — supporting-page elevation

1. Contact step flow.
2. Service-specific visuals.
3. Case-study storytelling and media.
4. Utility states and final responsive polish.

## 10. Verification matrix

Test every sprint at:

- 320×568 compact Android.
- 390×844 modern iPhone.
- 430×932 large phone.
- 768×1024 tablet portrait.
- 1024×768 tablet landscape.
- 1440×900 desktop.
- 1920×1080 wide desktop.

For each size verify:

- English and Arabic route parity.
- LTR/RTL layout and logical spacing.
- Keyboard and screen-reader navigation.
- Touch targets and sticky CTA clearance.
- No horizontal overflow.
- No content hidden behind fixed navigation.
- Reduced-motion behavior.
- Canvas pause/resume behavior.
- No console errors or hydration mismatches.
- LCP, CLS, and INP remain within Core Web Vitals targets.

## 11. Definition of done

The elevation project is complete when:

- Wave 4's Arabic and mobile requirements are fully shipped, not simulated with inline bilingual copy.
- Every major section has one purposeful signature behavior.
- Mobile feels composed independently rather than compressed from desktop.
- Service and case-study pages match the quality of the homepage.
- Motion remains calm, fast, touch-accessible, and reduced-motion safe.
- The site is more alive without becoming busier.
