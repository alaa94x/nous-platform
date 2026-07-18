# Nous Document Operations — Implementation Report

Updated: 18 July 2026

## Outcome

The admin portal now has a usable first production slice for manual operations and data-driven quotation/invoice drafting. It does not require old-project importing: records are entered manually, as requested. Production data remains untouched by this implementation.

## Completed

- Secure document, customer, project, vendor, cost, payment, revision, audit, permission, credit/refund, reminder and delivery schema.
- Published Nous quotation and invoice template identities with white paper, Deep Ink, Emerald Pine and restrained Lime.
- Database-backed quotation/invoice builder with customer and project linking.
- Repeatable charge, credit and informational line items with automatic minor-unit calculations.
- Flexible document sections that can be added, removed, reordered or hidden per project.
- Draft creation and immutable revision history through `save_document_draft`.
- Saved-draft reopening and revision creation without changing the shared visual template.
- Manual customers, current projects, historical projects, vendors/freelancers and reminders.
- Historical projects are completed and reminder-free by default.
- Telegram destination setup, reminder scheduling, delivery attempts and the five-minute cron endpoint.
- Simplified admin navigation with four focused mobile destinations and iconography consistent with the interface.
- Issuer setup gate when no company identity exists.
- Repeatable Elite Collection demo seed with a current quotation project, historical invoice project, freelancer cost/payment and reminders, plus a matching cleanup script.

## Production migration order

1. `017_document_automation_foundation.sql`
2. `018_document_operations_extensions.sql`
3. `019_document_draft_workflow.sql`

Migration 019 is required for the live builder. It seeds the two published templates and installs the permission-checked draft-saving RPC.

## Production environment

Set these server-side values for Telegram delivery:

- `TELEGRAM_BOT_TOKEN`
- `CRON_SECRET`
- `NEXT_PUBLIC_ADMIN_URL`

Keep the bot token and cron secret out of browser-exposed variables.

## Verified

- Admin TypeScript check passes.
- Admin ESLint passes for the new Documents, Operations and navigation code.
- The optimized Next.js production build compiles and generates all admin routes successfully.
- Shared document-calculation and database package TypeScript checks pass.
- Git whitespace validation passes.
- Migrations 017, 018 and 019 execute together in an isolated PostgreSQL validation database.
- The unauthenticated development document route renders the issuer setup gate correctly. Authenticated data operations were not simulated or written into the connected production database.

## Remaining production slices

The schema is ready, but these are not represented as completed UI workflows yet:

- issue/approve/send workflow and transactional number allocation from the interface;
- server PDF rendering, storage and download delivery history;
- linked credit-note creation and refund entry screens;
- project cost, incoming payment and outgoing freelancer-payment screens;
- historical attachments;
- automatic reminder creation from invoice and vendor due dates;
- snooze, complete and cancel reminder actions;
- template editor and version comparison UI.

These must remain separate from draft creation because issuing, payment and refund actions change financial state and require stronger release gates.

## UX decisions

| Before | After | Why |
|---|---|---|
| Fixed quotation/invoice content | Repeatable line items and project-specific sections | One visual identity can serve different projects without editing HTML |
| Many technical areas in navigation | Operations, Documents and a focused four-item mobile bar | Reduces choice overload and keeps common work reachable |
| Decorative status language | Plain setup, draft and connected states | Makes the admin feel operational rather than experimental |
| One large form | Progressive add-record forms and collapsible section detail | Keeps the first action clear while preserving depth |
