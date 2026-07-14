# Nous — Living Logic Redesign Implementation Report

**Completed:** 13 July 2026  
**Scope:** expanded creative research, public website, mobile-first behavior, English/Arabic localization, motion system, supporting routes, admin editorial controls, database model, and production verification.

## Executive result

The site is no longer organized as a visual imitation of CB Website Design. It now has a distinct creative system called **Living Logic**: Nous is presented as a studio that turns difficult ideas into clear, working systems. The interface expresses that idea through a persistent visual language of signals, traces, nodes, fields, lenses, archives, and convergence rather than inherited agency-site decoration.

The three supplied brand colors remain the anchors:

- Emerald pine `#084734`
- Lime glow `#CEF17B`
- Green tea `#CDEDB3`

They are now part of a complete tonal and semantic palette with dark ink, warm paper, muted copy, dividers, states, and controlled glow values. Typography, spacing, responsive rules, Arabic direction, touch behavior, and animation timing are also treated as systems instead of isolated effects.

## Before / after / why

| Area | Before | After | Why |
|---|---|---|---|
| Creative identity | Layout, hero, pacing, and blurred atmosphere strongly recalled the reference site | An original Living Logic direction with six recurring visual instruments | Gives Nous a recognizable idea that can extend to every page |
| Hero background | Visually dependent on pointer movement and otherwise static | Autonomous Assembly Field with ambient motion, pointer response, touch response, visibility pausing, and reduced-motion fallback | The first screen stays alive on desktop and phone without demanding interaction |
| Hero composition | Large copy and blur competed for space; mobile could crop or leave large blank areas | Deliberate copy zone, visual field zone, action group, metadata, and bottom system rail | Establishes hierarchy and keeps every required element visible |
| Homepage | Sections behaved like separate agency-template blocks | A connected sequence: Assembly → Trace → Lens → Process → Archive → Pulse → Answers → Convergence | Creates a journey that is easier to remember and harder to mistake for a clone |
| Motion | Similar reveal behavior applied broadly | Motion grammar by purpose: reveal, focus, assemble, pulse, converge, and ambient drift | Movement explains structure instead of decorating everything equally |
| Mobile | Desktop composition compressed into a narrow viewport | Authored mobile layouts, compact hero, touch-safe navigation, fluid canvas, stacked editorial rhythm, and 44px controls | Mobile becomes a designed experience, not a fallback |
| Arabic | Partial translations and inherited Latin composition | `/ar` route system, native RTL, Arabic display/body fonts, localized navigation, homepage, services, cases, contact, metadata, and admin fields | Arabic users receive an intentional experience rather than mirrored English |
| Services and cases | Generic inner-page structure | Lens-based service pages and Archive-based case studies, both responsive and bilingual | Supporting pages now belong to the same brand world as the homepage |
| Admin portal | Only a subset of homepage copy and testimonial fields were editable | Bilingual controls for every homepage chapter, FAQ, hero narrative, services, and testimonials | Editorial changes no longer require code edits |
| Runtime resilience | Placeholder Sentry values could interrupt hydration and leave reveal sections invisible | Sentry initializes only with usable credentials; the site renders normally without monitoring configured | A missing monitoring account must never break the public experience |

## Research and creative decision

The research was deliberately expanded beyond agency award galleries. It considered:

- Awwwards/CSS Design Awards patterns and their common imitation risks
- Product interfaces and hardware brands with disciplined interaction design
- Editorial storytelling and data journalism
- Generative-art and spatial-computing studios
- Museums and cultural institutions
- Arab design archives and bilingual editorial systems
- Accessibility, performance, touch-target, and motion guidance
- Modern prototyping tools and template ecosystems to identify saturated visual patterns

The conclusion was to avoid a collage of fashionable effects. Nous needed one idea with enough depth to govern layout, copy, motion, mobile, Arabic, admin content, and future pages. The full benchmark matrix, source links, palette study, typography study, alternative directions, and revised sprint plan are recorded in `NOUS_CREATIVE_DIRECTION_RESEARCH.md`.

## Implemented design system

### Typography

- **Instrument Sans:** English display and interface typography
- **Alexandria:** Arabic display typography
- **IBM Plex Sans Arabic:** Arabic body copy
- **Space Mono:** system labels, indices, metadata, and technical signals
- Responsive type uses `clamp()` and language-aware line height rather than fixed desktop sizes

### Visual instruments

1. **Assembly Field** — hero canvas; autonomous nodes and connections that respond to pointer and touch.
2. **Trace** — the “Why Nous” chapter; decisions and evidence move through a structured line.
3. **Lens** — capabilities and service pages; brings one system into focus while retaining context.
4. **Assembly** — process chapter; shows how work moves from ambiguity to shipped system.
5. **Archive** — selected work and case studies; evidence-led project presentation.
6. **Pulse** — testimonial chapter; controlled signal movement around client evidence.
7. **Convergence** — final contact chapter; all visual threads resolve into one action.

### Motion rules

- Ambient hero motion continues when the pointer is idle.
- Pointer input adds influence instead of being the only source of movement.
- Touch input works on mobile without hover assumptions.
- Intersection observers pause costly work outside the viewport.
- Reveal behavior is section-aware and does not leave content permanently hidden.
- `prefers-reduced-motion` removes non-essential animation and preserves a complete static composition.
- Press, focus, and hover feedback use short, consistent durations and avoid elastic novelty.

## Public website implementation

### Global shell

- Reworked navigation, logo behavior, bilingual language switch, focus states, skip link, and mobile bottom rail.
- Added a central motion observer and removed the old one-size-fits-all reveal hook.
- Added complete English/Arabic dictionaries, localized route helpers, and document locale handling.
- Established semantic color, type, spacing, motion, and layer tokens.
- Updated footer typography, sitemap links, contact controls, and mobile touch targets.

### Homepage chapters

- **Hero / Assembly Field:** rebuilt composition, autonomous canvas, stronger promise/action hierarchy, mobile fluid behavior, idle state, touch state, reduced-motion state.
- **Why Nous / Trace:** clearer positioning and decision-led visual narrative.
- **What We Build / Lens:** outcome-led capabilities with an interactive focal instrument.
- **How the Work Moves / Assembly:** process and engagement shapes presented as one working sequence.
- **Selected Work / Archive:** evidence-first project rhythm with responsive case navigation.
- **Client Evidence / Pulse:** lead and secondary testimonial composition with localized content.
- **Before We Begin:** editable bilingual FAQ with structured data support.
- **Contact / Convergence:** high-contrast final action with response expectation and ambient convergence field.

### Mobile mastery — Phase 1 hero hierarchy

The first device-led refinement pass responds directly to the iPhone 17 Pro Chrome and Samsung S23 Ultra Samsung Internet captures. This phase intentionally changes only the hero hierarchy; the living-field tuning and floating adaptive navigation remain separate phases so they can be judged independently on real phones.

- Removed the long supporting paragraph from the visible mobile composition while retaining it as screen-reader content. Desktop keeps the complete editorial deck unchanged.
- Replaced the repeated mobile eyebrow with the localized compact identity `Digital systems / Doha` and its Arabic equivalent.
- Reduced the autonomous signal phrase to a 36–46px supporting moment and the stable headline to a 43–52px range, restoring one clear primary focal point.
- Rebuilt the mobile actions as a 50px lime capsule plus a borderless 44px secondary action instead of two heavy full-width panels.
- Replaced “Touch the field” with the localized scroll cue and tightened short-height behavior without reducing touch targets.
- Simplified the mobile topline to two anchored labels and removed its decorative rule.
- Verified English at 360 × 780 and 390 × 844, Arabic at 390 × 844, and desktop English at 1440 × 900. There is no horizontal overflow, the action group clears the fixed rail, Arabic remains native RTL, and the desktop deck remains visible and unchanged.
- TypeScript, ESLint, Git diff validation, and browser runtime diagnostics pass for this phase.

### Mobile mastery — Phase 2 living field

The second device-led pass turns the open middle of the simplified hero into an intentional living stage while keeping navigation unchanged for separate evaluation.

- Removed the roaming mobile focus circle. Desktop retains the original interactive lens; mobile touch now belongs exclusively to the fluid field.
- Replaced the bordered signal card with a borderless 110px phrase stage embedded directly in the fluid field. The active phrase is a single 29–38px line with no visible numbering and three unnumbered dot controls beneath it.
- Removed “Sentient Logic” from the visual mobile hierarchy so the rotating signal is the sole large statement. The original H1 remains as a one-pixel semantic heading for search engines and assistive technology; desktop keeps the complete headline treatment.
- Added three stable 44 × 44px signal controls with explicit labels and pressed states. Selecting a phrase updates immediately and pauses automatic progression for eight seconds.
- Moved automatic phrase progression to an independent five-second timer, so it continues even if canvas rendering pauses or reduced-motion preferences disable spatial animation.
- Increased mobile fluid visibility by opening the atmosphere mask, distributing autonomous currents through the upper and middle field, and adding a slow transform/opacity ambient current.
- Calibrated the WebGL mobile simulation to 30fps on coarse/low-power devices, a 1.5 DPR ceiling, 96px simulation buffers, 512px dye buffers, bounded touch forces, seven restrained seed currents, and slightly stronger mobile dye energy.
- Touch creates a controlled fluid disturbance, dragging influences velocity without moving the phrase, and work pauses while the hero or document is not visible.
- Existing Assembly Field fallback remains animated when WebGL is unavailable; reduced motion freezes spatial motion and preserves a complete, readable composition.
- Verified English at 360 × 780 and 390 × 844, Arabic phrase selection at 390 × 844, and desktop English at 1440 × 900. Mobile has no roaming lens or horizontal overflow, all signal targets are 44px, desktop keeps its lens and complete deck, and no browser runtime errors were observed.
- Compared viewport captures 2.2 seconds apart after pausing the phrase state. Their image hashes and byte sizes differ, confirming that the rendered fluid field itself changes over time rather than only the copy.

### Mobile mastery — Phase 3 adaptive navigation

The third mobile pass replaces the heavy framed navigation with a lighter two-state floating system inspired by compact social-app navigation behavior without copying its visual language.

- Rebuilt the top mobile brand strip as a 50px rounded glass capsule with tighter padding, a softer edge, and a slightly denser scrolled material state.
- Enlarged and rebuilt the compact language target as a 46px layered control with a clearer locale mark, lime status signal, stronger edge, and proper press/focus feedback.
- Rebuilt the expanded bottom rail as a 60px floating capsule with two icon-and-label destinations and one 48px circular lime project action.
- Added a separate 196 × 50px compact icon rail. The two material states crossfade and translate using only opacity and transforms; the interface does not animate layout width.
- The rail remains expanded within the first 48px, compacts after 30px of deliberate downward travel, and restores after 18px of upward travel. Small browser-toolbar scroll noise does not switch the state.
- The top brand/language strip now slides and fades out on deliberate downward travel, then returns on upward intent, focus, or proximity to the top. It uses transforms and opacity only, and reduced-motion users receive an immediate state change.
- Keyboard focus always restores the expanded state. Compact visual duplicates are excluded from the accessibility tree, while the persistent labeled links remain available and become visible on focus.
- Active-section signals update in both expanded and compact layers. Every compact destination remains 44 × 44px and the project action remains visually distinct.
- Reduced-motion and reduced-transparency fallbacks cover both navigation materials.
- Verified expanded-to-compact and compact-to-expanded transitions at 390 × 844, English and Arabic direction/controls, 360 × 780 compact fit, and desktop navigation at 1440 × 900. No horizontal overflow or browser runtime errors were observed.

### Mobile mastery — Phase 4 focused hero and capability viewport

This pass removes the last competing mobile hero elements and rebuilds “What We Build” around one complete, swipeable viewport.

- Centered `Digital systems / Doha` and its Arabic equivalent immediately above the primary action, then converted the secondary action to a bordered WhatsApp capsule with the proper WhatsApp icon.
- The hero WhatsApp action reuses the enabled WhatsApp URL in the admin-managed footer contact items. Its bilingual label remains editable through the existing secondary CTA fields, now relabeled as WhatsApp CTA fields in the admin portal.
- Added a restrained two-pulse signal blink to `NOUS / 01`; reduced-motion preferences disable it.
- Removed the generic capabilities subtitle fallback from desktop record cards and the mobile active card. Unique per-service descriptions still appear when explicitly authored in the admin.
- Moved the six mobile capability tabs beneath the active card as a compact horizontal snap rail. Tapping a tab updates the card and recenters only the rail—never the document.
- Added horizontal touch swiping on the active card to move to the previous or next capability while preserving native vertical page scrolling.
- Compressed the mobile instrument, outcomes, action, selector, and surrounding rhythm so the complete section fits in one normal phone viewport. Height-aware steps preserve the full layout at 375 × 812 and visually hide only the section subtitle below 760px while retaining it for assistive technology.
- Added bottom safe-area protection and verified selector clearance above the floating navigation: 21px at 390 × 844, 24.5px at 375 × 812, and 11.8px at 375 × 740.
- Reproduced the capability-06 failure: after selecting `Design & Brand`, `scrollX` remains `0`, vertical reading position remains unchanged, and only the horizontal rail advances to the selected item.
- Verified English and Arabic mobile layouts, six selectable tabs, RTL fit, zero horizontal overflow, no repeated generic card description, and no bottom-navigation overlap.

### Mobile stabilization — scroll and navigation continuity

This pass addresses the final real-device navigation problems: abrupt state changes, the compact rail consuming the first tap, and mobile browser chrome causing the page composition to resize during one swipe.

- Replaced scale-based top and bottom navigation state changes with a controlled translate-and-fade transition. The main movement runs for 280ms on the interface ease curve, while opacity settles in 210ms, so the controls retain their physical size throughout the transition.
- Added asymmetric scroll intent thresholds—42px down and 32px up—with a 260ms state hold. This prevents a single finger gesture or browser-toolbar bounce from rapidly reversing the navigation state.
- Separated pointer input from keyboard focus. A compact-menu link now follows its destination on the first touch; only genuine keyboard tab focus requests the expanded labeled rail.
- Synchronized the top brand bar and bottom rail through one navigation state controller so they enter and leave as one coordinated system.
- Stabilized mobile hero sizing on `100svh` and replaced live `max-height` layout switching with a device-height profile captured once on mount. Browser chrome expanding or collapsing no longer changes section typography, spacing, or component scale mid-scroll.
- Applied the same stable device-height profile to the mobile capability chapter, removing toolbar-sensitive height media queries that could recompose the card during a swipe.
- Replaced the legacy infinity-orbit canvas fallback with an always-mounted lightweight fluid-gradient layer. iPhone and iPad now show the emerald fluid direction immediately, crossfade to WebGL only after its first successful frame, and return to the fluid fallback automatically if Safari loses its GPU context. Reduced-motion mode keeps the same art direction without positional movement.
- Verified at 390 × 844 that one downward gesture compacts the rail, one upward gesture restores it, the hero remains exactly 844px high in both directions, a single compact-link tap reaches its destination, horizontal overflow remains false, and the browser error log remains empty.

### Supporting routes

- Rebuilt service pages in the Lens system.
- Rebuilt case-study pages in the Archive system.
- Localized English and Arabic service/case routes.
- Refined the multi-step contact route for small screens, safe-area behavior, readable inputs, and fixed mobile actions.
- Updated not-found, error, offline, email notification, Open Graph, sitemap, and service-worker surfaces so they use the current typography and route model.

## Arabic and bidirectional behavior

- English remains at `/`; Arabic lives under `/ar`.
- Homepage, contact, service, and work routes have Arabic counterparts.
- Document `lang` and `dir` switch to `ar` and `rtl` after localized navigation.
- Layout direction is authored per component; icons and visual fields are mirrored only when meaningfully directional.
- Arabic uses its own font sizes, line heights, and tracking rules rather than inheriting Latin typography.
- Service, project, testimonial, FAQ, and homepage settings now have Arabic data fields or localized controls.

## Admin portal and data model

### Homepage settings

The settings portal now exposes bilingual controls for:

- Hero label, title, deck, primary action, secondary action, note, and narrative statements
- Why Nous title and supporting copy
- Capabilities label, title, and subtitle
- Process title, subtitle, and engagement heading
- Work label, title, and introduction
- Testimonial label and title
- FAQ label, title, introduction, and five question/answer pairs
- Contact title, supporting copy, action label, and response note
- Footer/contact data already managed by the existing settings system

Arabic completion is calculated across the full set of `_ar` fields instead of a small hard-coded subset.

### Testimonials

Added editable `quote_ar`, `author_ar`, and `role_ar` values, Arabic completion feedback, database types, and localized homepage querying.

### Services and projects

- The service content schema now matches the editorial fields already used by the admin portal.
- Arabic service and project fields are represented in migrations and types.
- Admin project/service views were made more responsive and more explicit about content completeness.

### Database migrations

Apply these in order in the target Supabase project:

1. `010_arabic_content_fields.sql`
2. `011_hero_narrative_settings.sql`
3. `012_service_content_model.sql`
4. `013_home_chapters_and_testimonial_locales.sql`
5. `014_hero_living_field.sql`

Migrations 013 and 014 are non-destructive: they add locale/hero settings with `on conflict do nothing`, so they do not overwrite production editorial decisions. Migration 014 keeps the former hero proof settings intact for rollback while adding the three localized Living Field phrases and its interaction hint.

## Responsive and accessibility verification

### Browser matrix exercised

| View | Routes checked | Result |
|---|---|---|
| Desktop, English | homepage, service, work | Correct hierarchy, field placement, section reveals, and no horizontal overflow |
| Mobile 390 × 844, English | homepage, service, work, contact | No horizontal overflow; hero, navigation, forms, and footer fit correctly |
| Mobile 390 × 844, Arabic | homepage, service, contact | Native RTL, Arabic fonts, localized copy, no horizontal overflow |
| Touch target audit | homepage and contact controls | No rendered interactive target below 44 × 44 after final pass |
| Form audit | contact route | Inputs are labelled; input height 44px; textarea height 63px; no overflow |
| Media audit | all tested routes | No image missing an `alt` attribute |
| Console audit | clean local run | No application runtime errors; only normal development HMR/React messages |

The homepage was also exercised by scrolling through the complete section sequence. The motion observer revealed all animated sections and the hero continued moving without pointer input.

### Source and production checks

| Check | Result |
|---|---|
| TypeScript — web | Pass |
| TypeScript — admin | Pass |
| TypeScript — shared UI | Pass |
| TypeScript — database package | Pass |
| ESLint — web | Pass |
| ESLint — admin | Pass |
| Next.js production build — web | Pass, 31 routes generated/validated |
| Next.js production build — admin | Pass, dashboard/settings/testimonial routes generated/validated |

## Runtime fixes

- Monitoring configuration now validates Sentry DSNs before initialization on the public app.
- Placeholder credentials no longer interrupt hydration or prevent motion/reveal components from mounting.
- Local development accepts localhost, `127.0.0.1`, and configured LAN origins.
- The service worker and public routes were updated for the current route set.

## Stabilization wave — hero, cache, palette handoff, and navigation

This wave deliberately froze the wider hero composition and improved reliability around it instead of introducing another visual concept.

- Fixed the WebGL fluid lifecycle failure that could occur when React reconnected effects during a language transition. A fresh effect now always creates fresh framebuffers, even when the canvas dimensions have not changed.
- Changed service-worker routing so HTML and React Server Component payloads are never reused as stale app-shell state. The worker itself is revalidated without browser caching and production registration requests an immediate update.
- Calmed the signal reveal: slower phrase changes, higher contrast, a fixed `01 / 03` state marker, and a lens that holds the user’s last position instead of repeatedly snapping back.
- Added a scrollable dark-to-Green-Tea bridge and made `#E4F5D4` the shared canvas for the post-hero chapters and footer.
- Rebuilt the desktop header around section indices, a controlled active signal line, dense glass only after scrolling, and a stable CTA. Pointer-driven magnetic displacement was removed from navigation.
- Rebuilt the phone rail with unequal columns that match content priority, 52–56px targets, an opaque-enough glass layer for reliable legibility, active-section tracking, and a wider project CTA in English and Arabic.
- Added a narrow-viewport safeguard that hides the desktop custom cursor when responsive tools or split view reduce an already-mounted desktop session below 900px.
- No new admin fields were required: this wave changes interaction, navigation, cache policy, and tonal presentation while continuing to use the existing localized route labels and editable content.

Deferred reveal explorations for a later, explicitly approved hero sprint:

1. **Indexed stations:** the lens locks to three authored coordinates; pointer proximity selects a station without dragging the entire instrument.
2. **Signal sweep:** one slow scanning band reveals the phrase while the `01 / 03` marker advances only after a dwell threshold.
3. **Constellation focus:** three small numbered nodes remain stable; tapping or hovering a node resolves its phrase in one fixed high-contrast reading zone.

The constellation option is the recommended next prototype because it strengthens the numbered-system idea, works naturally with touch, and removes the remaining dependence on free-moving reveal geometry.

## Capabilities / Lens and contextual-cursor refinement

This pass tightened the light-canvas chapters without changing the approved hero direction.

- Made the principal chapter headings a compact, responsive, single-line system across Why Nous, Capabilities, Process, Work, Testimonials, and FAQ. English and Arabic sizes are calibrated separately, and the current copy was verified without horizontal overflow at 390px and 1440px.
- Fixed the disappearing capability rows at the source. The rows previously combined React-owned state classes with an observer that imperatively added `is-revealed`; a hover/state render could overwrite that class and return a row to `opacity: 0`. Stateful capability records no longer participate in that imperative reveal contract, so all six stay visible through hover, selection, and expansion.
- Replaced the flat side orbit with a focus-and-context Lens: a shallow pointer-responsive plane, intersecting elliptical paths, stable grid/axes, numbered nodes, and a dimensional focal core. Text remains on the stationary reading plane so depth supports hierarchy without reducing legibility.
- Reworked outcome pills into numbered system modules with stronger edge definition and clearer selected/open states.
- Added a restrained contextual cursor vocabulary for desktop: `+` for expandable rows, `−` for an open row or FAQ, and `↗` for outbound/detail actions. The visible buttons and native disclosure controls remain the actual interaction targets, so the cursor is an enhancement rather than the only affordance.
- Increased cursor contrast on both dark pine and Green Tea canvases by using a difference-mode light ring/dot, and reduced the ambient field to a quieter, more localized response.
- Disabled pointer-depth movement on touch layouts and under reduced-motion preferences. The mobile Lens uses a composed static depth view, preserves its labels, and stays within the viewport.
- No new admin fields were needed for this pass. It changes presentation and interaction while continuing to use the existing localized capability and chapter content.

### Refinement verification

| Check | Result |
|---|---|
| Desktop English, 1440 × 1000 | Single-line chapter title, full capability list and Lens visible in one chapter view; all records retain `opacity: 1` after selection |
| Mobile English, 390 × 844 | No horizontal overflow; all six audited chapter titles remain one line; Lens is contained |
| Desktop Arabic, 1440 × 1000 | RTL title remains one line; Lens is 630 × 598; all six records remain visible |
| Mobile Arabic, 390 × 844 | Native RTL, no horizontal overflow; Capabilities title remains one line; Lens is contained at 335px width |
| Context states | Closed capability `+`, open capability/FAQ `−`, and detail action `↗` are exposed through explicit cursor state attributes |
| TypeScript — web | Pass |
| ESLint — web | Pass |
| Git whitespace/error check | Pass after final cleanup |
| Production build — web | Pass; optimized compilation completed and 31 routes were generated/validated |

### Premium Capability Observatory revamp

The refined Lens was subsequently rebuilt as a complete Capability Observatory rather than a dark graphic placed beside a conventional accordion.

- The Green Tea chapter now has dimensional lighting, a restrained technical grid, depth rings, and soft tonal variation while preserving the approved `#E4F5D4` foundation.
- The desktop capability navigation is a raised system dock. Each capability is a layered module with a dimensional status node, a circular disclosure control, a focused elevation state, outcome modules, and an integrated service action.
- Hover previews the selected capability in the Observatory, while the expanded system remains visually unambiguous. Leaving the dock restores the expanded capability as the active reference.
- The Observatory contains one shaded primary sphere, three animated orbital paths, three secondary spheres, rotating surface detail, slow aurora drift, stationary axes, outcome callouts, and a moving input-to-output signal. Motion is deliberately slow and transform/opacity based.
- Pointer movement adds shallow spring-like perspective on fine-pointer devices. Touch devices do not inherit desktop pointer tracking.
- Mobile no longer renders or compresses the desktop Observatory. It uses a horizontal scroll-snap capability selector and one focused dark card with a compact dimensional signal, localized description, two-column outcomes, and a 50px service action.
- The complete desktop visual is hidden on mobile, so its heavier ambient animations do not run behind the phone composition.
- English and Arabic were verified at 1440 × 1000 and 390 × 844 with no horizontal overflow. RTL reverses the system dock and Observatory naturally, all six records remain visible, mobile targets remain at least 44px, and reduced-motion rules stop every decorative orbit/drift animation.
- This revamp consumes the existing service names, tags, outcomes, descriptions, and routes. It requires no additional admin fields or production database migration.

### Accessibility and normal-zoom visibility pass

The Capability Observatory no longer expects users to reduce browser zoom to understand the complete composition.

- The type hierarchy now uses a restrained 52px laptop heading, 16–18px supporting copy, 23px capability names, and stronger 9–10px technical labels. Low-contrast metadata was lifted while the visual hierarchy remains quiet.
- Desktop layouts respond to viewport height as well as width. At heights up to 1050px, and again at 850px or less, space is removed from padding, row chrome, and the observatory stage while readable text sizes and 44px actions are preserved.
- At 1723 × 813, the full English capability rail ends at 753px and the Observatory at 730px. Arabic ends at 745px and 738px respectively. Both fit at 100% zoom with no horizontal overflow.
- At a 862px-wide zoom-equivalent viewport, the desktop instrument reflows to the touch-first mobile composition instead of compressing its copy or overflowing sideways.
- English and Arabic mobile views were rechecked at 390 × 844. They retain 15–16px body copy, 50px primary actions, 84px capability tabs, native RTL, and no horizontal overflow.
- `:focus-visible` treatments were added to view toggles, capability disclosures, service links, mobile tabs, and mobile actions. Semantic pressed, expanded, tab, selected, and tabpanel states remain exposed to assistive technology.
- The Arabic mobile tab interaction was exercised in-browser: selecting the second tab updates both `aria-selected` and the visible tabpanel heading. No page runtime errors were observed.
- TypeScript, ESLint, the Git whitespace/error check, and the production web build all pass after this accessibility pass; the build generated and validated 31 routes.

## Launch checklist

These are deployment/content actions, not unfinished interface implementation:

- [ ] Apply migrations 010–014 to the production Supabase database.
- [ ] Review and publish Arabic service, project, testimonial, FAQ, and homepage copy in the admin portal.
- [ ] Replace the current database hero copy if “Sentient Logic” is no longer desired. Existing Supabase values correctly override code defaults and were intentionally not overwritten.
- [ ] Confirm whether `nouslab@icould.com` is intentional. It appears consistently in the existing project; do not change it to `icloud.com` without owner confirmation.
- [ ] Add real Sentry DSN/auth values or leave monitoring variables empty; do not use placeholder URLs.
- [ ] Update `ALLOWED_DEV_ORIGINS` whenever the development machine’s LAN IP changes.
- [ ] Replace remaining placeholder/external project imagery with approved production assets where applicable.
- [ ] Review final production copy with the stakeholder before launch.

## Known non-blocking framework notices

- Local development deliberately uses Webpack because Next.js 16.2.9 Turbopack can panic while compiling instrumentation in this workspace. Production builds may continue using Next.js defaults.
- The public app suppresses only Sentry/OpenTelemetry's known `require-in-the-middle` static-analysis warning. Monitoring remains disabled whenever its DSN is empty or a placeholder.
- Both applications now use the Next.js 16 `proxy.ts` convention, and the Sentry build options use their current `webpack.*` paths.

## Local and phone runbook

Install and start the public site:

```bash
pnpm install
pnpm dev:web
```

Open `http://localhost:3002` on the computer.

For a phone on the same Wi-Fi:

1. Find the Mac’s current Wi-Fi IP with `ipconfig getifaddr en0`.
2. Put that IP in `ALLOWED_DEV_ORIGINS` in `apps/web/.env`.
3. Restart `pnpm dev:web`.
4. Open `http://YOUR_IP:3002` on the phone.

The server already binds to `0.0.0.0`. If the phone cannot connect, confirm both devices are on the same non-guest network and allow incoming Node connections in the macOS firewall.

Start the admin separately with:

```bash
pnpm dev:admin
```

The admin uses port 3001.

## Final assessment

The redesigned system has a coherent visual thesis, bilingual foundation, mobile-authored behavior, purpose-led motion, and editable content model. Its distinctiveness now comes from the relationship between idea, copy, interaction, and evidence—not from adding more effects. Future additions should reuse the Living Logic instruments and motion grammar instead of introducing unrelated visual tricks.
