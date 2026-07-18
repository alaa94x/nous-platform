# Nous Document Operations — Implementation Plan

Updated: 18 July 2026

## Product rule

The module should feel simple before it feels powerful. Every screen has one primary action, optional details remain collapsed until requested, and decorative status indicators are excluded.

The visual identity remains white paper with Deep Ink and Emerald Pine. Lime is reserved for primary actions and totals, not decoration.

## What is already built

- [x] Repeatable Elite Collection demo seed and cleanup script based on the supplied quotation and invoice references
- [x] Customers, contacts, operational projects, vendors and freelancer links
- [x] Quotation and invoice records with transactional numbering foundation
- [x] Reusable templates and immutable template versions
- [x] Document revisions, line items and immutable snapshot storage foundation
- [x] Minor-unit totals, discounts, credits, balances, project profit and margin
- [x] Approvals, statuses, payment allocation, audit log and role permissions
- [x] White quotation and invoice reference previews using Nous dark colors
- [x] Flexible per-revision document section storage
- [x] Manual historical project metadata and source attachments
- [x] Credit-note and refund data foundation
- [x] Telegram-ready reminders and delivery tracking foundation

## How the added feedback changes the plan

| Area | Before | Now | Reason |
|---|---|---|---|
| Document creation | Edit a reference-template preview | Choose a visual template, then fill, add, remove and reorder project-specific sections | The design identity stays consistent without forcing identical content |
| Old projects | Import workflow considered | Manual “Add past project” flow only | Lower complexity and better control over inconsistent old records |
| Invoice deduction | Credit field in a draft invoice | Draft credit line before issue; linked credit note and refund after issue | Issued invoices remain frozen and auditable |
| Notifications | Later generic activity feature | Focused reminders for receivables, payables, meetings, sending and follow-up | Direct operational value without a noisy dashboard |
| UI | Technical readiness labels and status dots | Plain title, one document switch, one form and one preview | Removes internal language and visual noise |

## Minimal navigation

1. **Documents** — quotations, invoices and credit notes
2. **Projects** — current and past projects, revenue, costs and files
3. **Customers** — customer and contact records
4. **Vendors** — freelancers, vendor costs and payments
5. **Reminders** — upcoming items and Telegram delivery status
6. **Settings** — issuer, bank, templates, numbering and Telegram connection

No separate dashboard card is required for every database concept. Details live inside the related customer, project or document.

## Delivery slices

### Slice 1 — Calm document builder

- [x] Simplify the template-studio header and remove readiness badges, dots and implementation status copy
- [x] Replace the fixed form with a section builder
- [x] Add, remove, reorder and hide sections
- [x] Add repeatable line items
- [x] Keep one live preview and one calculated total
- [x] Save a project-specific draft without modifying the visual template

Release gate: a user can create two different quotation structures from the same visual template without touching HTML.

### Slice 2 — Manual past projects

- [x] Add “Past project” as an option in the project form
- [x] Keep reminders off by default for past projects
- [ ] Allow historical totals, payments, costs and freelancer allocations in the UI
- [ ] Allow original quotation, invoice, receipt and contract attachments
- [ ] Show a clear “Historical” label in the project detail only

Release gate: an old project can be recorded in under two minutes without generating new documents or reminders.

### Slice 3 — Invoice adjustments and returned money

- [x] Allow credit/deduction lines while an invoice is still a draft
- [ ] Lock the issued invoice
- [ ] Create a linked credit note when an issued invoice must be reduced
- [ ] Record partial or full refunds against the credit note
- [ ] Prevent confirmed refunds from exceeding the credit note
- [ ] Recalculate customer balance and project cash profit

Release gate: the original invoice, credit note, refund and final balance reconcile exactly and remain in the audit history.

### Slice 4 — Telegram reminders

- [x] Connect one Telegram destination through a bot setup screen
- [ ] Create automatic reminders from invoice due dates and freelancer/vendor cost due dates
- [x] Add manual meeting, send, follow-up and custom reminders
- [ ] Support lead times, snooze, complete and cancel
- [x] Run a scheduled server job that claims pending deliveries safely
- [x] Send concise Telegram messages with project/document context and an admin link
- [x] Store attempts, Telegram message ID, failures and sent time
- [x] Keep the bot token only in server environment secrets

Release gate: retries do not create duplicate Telegram messages, overdue items remain visible, and a failed delivery is actionable in the admin portal.

### Slice 5 — Production documents

- [ ] Approval and issue workflow
- [ ] Transactional number allocation
- [ ] Frozen snapshot and PDF generation
- [ ] Download, email/share and delivery history
- [ ] Version comparison and complete activity log

Release gate: an issued PDF never changes after template, customer or project data is edited.

## Reminder defaults

- Client invoice: 7 days before, 2 days before, due day, and daily after due until paid
- Freelancer/vendor payment: 3 days before and due day
- Meeting: 24 hours and 1 hour before
- Document send/follow-up: one selected date, with optional snooze
- Historical project: no automatic reminders unless explicitly enabled

Defaults are editable in Settings and can be overridden per reminder.

## Security and reliability

- Telegram bot token is an environment secret, never a database field.
- Telegram chat IDs and delivery preferences are permission-protected.
- Scheduled delivery uses a unique reminder/destination/time key to prevent duplicates.
- Document snapshots and issued credit notes are immutable.
- Refund totals are enforced in the database, not only the interface.
- Every create, approve, issue, send, payment, refund and reminder change is audited.
