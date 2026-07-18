# Nous Mobile Clarity Implementation Report

Date: 15 July 2026  
Status: Implementation complete; ready for real-device acceptance testing.

## Objective

Reduce visual and interaction overload on mobile without flattening the Nous identity. The revised experience presents one clear idea at a time, keeps motion purposeful, and leaves deeper information available on demand.

## Completed plan

- [x] Audit mobile hierarchy, type, motion, navigation, content sources, admin fields, and production cache behavior.
- [x] Standardize mobile heading/body scales and remove competing decorative treatments.
- [x] Replace visible Unicode direction arrows with shared SVG icons to prevent iOS emoji rendering.
- [x] Shorten English and Arabic calls to action and update the matching admin fields.
- [x] Add guarded database migration `016_mobile_clarity_copy.sql` so existing custom stakeholder copy is preserved.
- [x] Remove the homepage custom cursor and all scroll-driven hero parallax.
- [x] Keep the top bar and mobile bottom navigation stable; remove compact/expanded switching and double-tap behavior.
- [x] Keep the fluid hero active while isolating it from the mobile phrase controls.
- [x] Preserve automatic phrase rotation and direct phrase selection.
- [x] Remove the mobile capability orb and “Active system” counter.
- [x] Reduce the capability card to a title, three outcomes, and one service action.
- [x] Convert process stages, engagement models, testimonials, and FAQs to mobile progressive disclosure.
- [x] Reduce work-card height and remove redundant mobile descriptions.
- [x] Simplify the contact CTA and keep all mobile contact-form fields readable in one continuous page.
- [x] Verify English and Arabic mobile layouts and desktop regression behavior.
- [x] Bump the service-worker cache namespace to `nous-v4` for a clean production handoff.

## Key outcomes

- Mobile page height at the tested content state dropped from about 10,276px to about 7,588px before the final FAQ and engagement reductions.
- The sixth capability changes the active card in one tap with no horizontal page overflow.
- The hero background remains visibly active on the phone layout while phrase rotation and selection work independently.
- Navigation no longer grows, shrinks, hides, or changes click targets while the user scrolls.
- Arabic RTL uses the same hierarchy and remains within the viewport.

## Verification

- `pnpm --filter @nous/web type-check` — passed.
- `pnpm --filter @nous/admin type-check` — passed.
- `pnpm --filter @nous/web lint` — passed.
- `pnpm --filter @nous/admin lint` — passed.
- `pnpm --filter @nous/web build` — passed after allowing the configured Google Fonts fetch.
- Browser QA — passed at 393×852 English, 393×852 Arabic RTL, and 1440×900 desktop.
- Interaction QA — automatic phrase rotation, manual phrase selection, last capability selection, stable navigation, and horizontal-overflow checks passed.

## Lighthouse stabilization — 18 July 2026

- [x] Analyze the supplied Lighthouse 13.3 mobile and desktop reports.
- [x] Separate site JavaScript from extension-injected audit noise (about 50 KiB site code versus 870 KiB extension code in the reported unused-JS total).
- [x] Remove the WebGL canvas layout read that ran on every animation frame.
- [x] Move canvas sizing to `ResizeObserver` and cached bounds.
- [x] Keep the mobile fluid active at a 24 fps ceiling, 1x DPR, seven pressure iterations, and smaller mobile simulation buffers.
- [x] Stop re-keying and replaying the mobile phrase entrance animation every five seconds.
- [x] Give the compact language switch an immediate system font so it cannot become a late font-swap LCP candidate.
- [x] Add accessible light-surface text tokens and apply them across About, Capabilities, Process, Work, Testimonials, Contact, FAQ, and Footer.
- [x] Fix the unnamed mobile contact navigation link and visible-label/accessibility-name mismatches.
- [x] Let project-card links derive their accessible name from their visible card content.
- [x] Allow the Cloudflare Insights script and beacon endpoint through the production CSP.
- [x] Re-run web type-check, lint, production build, and responsive browser verification.
- [ ] Deploy and run three clean Lighthouse passes per viewport with extensions disabled; use the median result.

Responsive verification after stabilization passed at 390×844 and 1440×900. The fluid canvas rendered at 1x mobile resolution, the mobile phrase had no entrance animation, the correct navigation variant displayed at each breakpoint, and neither viewport had horizontal overflow or browser console errors.

## Production rollout

1. Apply `packages/db/migrations/016_mobile_clarity_copy.sql` to production Supabase.
2. Deploy the web and admin applications from the same revision.
3. Confirm `/sw.js` serves the `nous-v4` cache name.
4. Test the live site on iPhone Safari/Chrome, Samsung Internet, and iPad Safari in English and Arabic.
5. If a device was pinned to the old PWA shell, close all site tabs once and reopen the site; the new service worker will delete older `nous-*` caches during activation.
