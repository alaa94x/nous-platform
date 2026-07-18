-- Nous document operations demo data
-- Requires migrations 017, 018 and 019.
-- Safe to rerun: every demo record uses a fixed UUID.
-- Run in the Supabase SQL editor. This file does not create auth users.

BEGIN;

DO $$
DECLARE
  quotation_template_version UUID;
  invoice_template_version UUID;
BEGIN
  SELECT dtv.id INTO quotation_template_version
  FROM public.document_template_versions dtv
  JOIN public.document_templates dt ON dt.id = dtv.template_id
  WHERE dt.slug = 'nous-quotation' AND dtv.is_published = true
  ORDER BY dtv.version_number DESC
  LIMIT 1;

  SELECT dtv.id INTO invoice_template_version
  FROM public.document_template_versions dtv
  JOIN public.document_templates dt ON dt.id = dtv.template_id
  WHERE dt.slug = 'nous-invoice' AND dtv.is_published = true
  ORDER BY dtv.version_number DESC
  LIMIT 1;

  IF quotation_template_version IS NULL OR invoice_template_version IS NULL THEN
    RAISE EXCEPTION 'Run 019_document_draft_workflow.sql before this demo seed';
  END IF;

  INSERT INTO public.issuer_profiles (
    id, legal_name, display_name, registration_number, email, phone,
    address, default_currency, is_default, active
  ) VALUES (
    '10000000-0000-4000-8000-000000000001',
    'Nous LLC', 'Nous', '05062', 'hello@nous.qa', '+974 7748 4004',
    '{"line1":"Office No. 4, Floor 9, QFC Tower 1","city":"Doha","country":"Qatar"}'::jsonb,
    'QAR', false, true
  ) ON CONFLICT (id) DO UPDATE SET
    legal_name = EXCLUDED.legal_name,
    display_name = EXCLUDED.display_name,
    registration_number = EXCLUDED.registration_number,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    active = true;

  INSERT INTO public.payment_accounts (
    id, issuer_profile_id, account_name, bank_name, iban, swift_code,
    currency, is_default, active
  ) VALUES (
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Nous LLC', 'Qatar National Bank (QNB)',
    'QA75QNBA000000000260242198001', 'QNBAQAQAXXX',
    'QAR', false, true
  ) ON CONFLICT (id) DO UPDATE SET
    account_name = EXCLUDED.account_name,
    bank_name = EXCLUDED.bank_name,
    iban = EXCLUDED.iban,
    swift_code = EXCLUDED.swift_code,
    active = true;

  INSERT INTO public.customers (
    id, display_name, legal_name, registration_number, email, phone,
    billing_address, default_currency, payment_terms_days, notes, active
  ) VALUES (
    '20000000-0000-4000-8000-000000000001',
    'Elite Collection', 'Elite Collection Trading', '115966',
    'accounts@elitecollection.qa', '+974 5000 0000',
    '{"city":"Doha","country":"Qatar"}'::jsonb,
    'QAR', 14,
    'Demo customer created from the supplied quotation and invoice references.',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    legal_name = EXCLUDED.legal_name,
    registration_number = EXCLUDED.registration_number,
    billing_address = EXCLUDED.billing_address,
    payment_terms_days = EXCLUDED.payment_terms_days,
    active = true;

  INSERT INTO public.customer_contacts (
    id, customer_id, name, job_title, email, phone, is_primary
  ) VALUES (
    '20000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'Elite Collection Team', 'Project Contact',
    'accounts@elitecollection.qa', '+974 5000 0000', true
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    job_title = EXCLUDED.job_title,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

  INSERT INTO public.client_projects (
    id, customer_id, code, name, description, status, currency,
    start_date, target_end_date, record_origin, original_created_at,
    reminders_enabled
  ) VALUES
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'ELITE-PHOTO-2026', 'Elite Product Photography',
    'One-day footwear studio production, editing and web-ready delivery.',
    'active', 'QAR', CURRENT_DATE, CURRENT_DATE + 14,
    'current', NULL, true
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'ELITE-WEB-2026', 'Elite Website & Admin Portal',
    'Historical website and admin portal development project from the supplied invoice.',
    'completed', 'QAR', DATE '2026-03-01', DATE '2026-06-05',
    'historical_manual', TIMESTAMPTZ '2026-03-01 09:00:00+03', false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    target_end_date = EXCLUDED.target_end_date,
    record_origin = EXCLUDED.record_origin,
    reminders_enabled = EXCLUDED.reminders_enabled;

  INSERT INTO public.vendors (
    id, kind, display_name, legal_name, email, phone, notes, active
  ) VALUES (
    '40000000-0000-4000-8000-000000000001',
    'freelancer', 'Noor Studio Photographer', 'Noor Studio Photographer',
    'photography@example.com', '+974 5111 1111',
    'Demo freelancer for the Elite product-photography project.', true
  ) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    active = true;

  INSERT INTO public.project_vendors (project_id, vendor_id, role, notes)
  VALUES (
    '30000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    'Product photographer', 'Full-day studio production and initial selects.'
  ) ON CONFLICT (project_id, vendor_id) DO UPDATE SET
    role = EXCLUDED.role,
    notes = EXCLUDED.notes;

  INSERT INTO public.documents (
    id, kind, issuer_profile_id, payment_account_id, customer_id,
    customer_contact_id, client_project_id, status, currency,
    issue_date, valid_until, due_date
  ) VALUES
  (
    '50000000-0000-4000-8000-000000000001',
    'quotation',
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001',
    'draft', 'QAR', CURRENT_DATE, CURRENT_DATE + 14, NULL
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    'invoice',
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000002',
    'draft', 'QAR', DATE '2026-06-05', NULL, DATE '2026-06-19'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.document_revisions (
    id, document_id, revision_number, template_version_id, title, subtitle,
    customer_snapshot, issuer_snapshot, project_snapshot, content_data,
    terms_data, calculation_data, subtotal_minor, line_discount_minor,
    document_discount_minor, tax_minor, total_minor, change_note
  )
  SELECT
    '51000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001', 1,
    quotation_template_version,
    'Product Photography', 'E-Commerce Footwear Image Production',
    to_jsonb(c), to_jsonb(i), to_jsonb(p),
    '{"source":"supplied quotation reference"}'::jsonb,
    '{"deposit":"50% on acceptance","balance":"50% before final handover","validity_days":14}'::jsonb,
    '{"subtotalMinor":400000,"lineDiscountMinor":0,"documentDiscountMinor":0,"taxMinor":0,"totalMinor":400000}'::jsonb,
    400000, 0, 0, 0, 400000,
    'Demo quotation created from the supplied HTML reference'
  FROM public.customers c
  CROSS JOIN public.issuer_profiles i
  CROSS JOIN public.client_projects p
  WHERE c.id = '20000000-0000-4000-8000-000000000001'
    AND i.id = '10000000-0000-4000-8000-000000000001'
    AND p.id = '30000000-0000-4000-8000-000000000001'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.document_revisions (
    id, document_id, revision_number, template_version_id, title, subtitle,
    customer_snapshot, issuer_snapshot, project_snapshot, content_data,
    terms_data, calculation_data, subtotal_minor, line_discount_minor,
    document_discount_minor, tax_minor, total_minor, change_note
  )
  SELECT
    '51000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000002', 1,
    invoice_template_version,
    'Website & Admin Portal Development', 'Second Payment (40%)',
    to_jsonb(c), to_jsonb(i), to_jsonb(p),
    '{"source":"supplied invoice reference","reference_number":"INV-#2026-003"}'::jsonb,
    '{"note":"The milestone charge represents the second 40% allocation. The 3D asset adjustment credit is applied directly."}'::jsonb,
    '{"subtotalMinor":1104000,"lineDiscountMinor":0,"documentDiscountMinor":0,"taxMinor":0,"totalMinor":1104000}'::jsonb,
    1104000, 0, 0, 0, 1104000,
    'Demo invoice created from the supplied PDF reference'
  FROM public.customers c
  CROSS JOIN public.issuer_profiles i
  CROSS JOIN public.client_projects p
  WHERE c.id = '20000000-0000-4000-8000-000000000001'
    AND i.id = '10000000-0000-4000-8000-000000000001'
    AND p.id = '30000000-0000-4000-8000-000000000002'
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.documents
  SET current_revision_id = CASE id
    WHEN '50000000-0000-4000-8000-000000000001' THEN '51000000-0000-4000-8000-000000000001'::uuid
    WHEN '50000000-0000-4000-8000-000000000002' THEN '51000000-0000-4000-8000-000000000002'::uuid
  END
  WHERE id IN (
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002'
  );

  INSERT INTO public.document_line_items (
    id, revision_id, sort_order, line_type, title, description,
    quantity, unit_price_minor, subtotal_minor, discount_minor,
    tax_minor, total_minor
  ) VALUES
  (
    '52000000-0000-4000-8000-000000000001',
    '51000000-0000-4000-8000-000000000001', 0, 'charge',
    'One-Day Footwear Photography & Website Delivery',
    'Studio session for five footwear models and colour variants, post-production, master files, web optimization and technical QA.',
    1, 400000, 400000, 0, 0, 400000
  ),
  (
    '52000000-0000-4000-8000-000000000002',
    '51000000-0000-4000-8000-000000000002', 0, 'charge',
    'Website & Admin Portal Development - Second Payment (40%)',
    'Milestone execution fee representing 40% of the QAR 29,600 project budget.',
    1, 1184000, 1184000, 0, 0, 1184000
  ),
  (
    '52000000-0000-4000-8000-000000000003',
    '51000000-0000-4000-8000-000000000002', 1, 'credit',
    '3D Creation Adjustment Credit',
    'Adjustment due to a scope design alteration.',
    1, 80000, -80000, 0, 0, -80000
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.document_revision_sections (
    id, revision_id, section_key, block_type, heading, content,
    sort_order, is_visible, page_break_before
  ) VALUES
  (
    '53000000-0000-4000-8000-000000000001',
    '51000000-0000-4000-8000-000000000001',
    'executive-summary', 'rich_text', 'Executive Summary',
    '{"body":"A comprehensive one-day footwear photography production tailored for the Elite Collection online store, combining studio capture, high-end editing, web optimization and technical review."}'::jsonb,
    0, true, false
  ),
  (
    '53000000-0000-4000-8000-000000000002',
    '51000000-0000-4000-8000-000000000001',
    'delivery-strategy', 'rich_text', 'Production Value & Delivery Strategy',
    '{"body":"Website-first production, a consistent product catalog, high-end post-production and technical quality assurance for responsive storefront use."}'::jsonb,
    1, true, false
  ),
  (
    '53000000-0000-4000-8000-000000000003',
    '51000000-0000-4000-8000-000000000001',
    'terms', 'terms', 'Project Terms & Milestones',
    '{"body":"One full production day. Initial edited gallery within three business days. High-resolution and web-optimized delivery. One consolidated revision round. 50% deposit on acceptance and 50% before final handover."}'::jsonb,
    2, true, false
  ),
  (
    '53000000-0000-4000-8000-000000000004',
    '51000000-0000-4000-8000-000000000002',
    'invoice-note', 'terms', 'Terms & Conditions Note',
    '{"body":"The website development charge represents the second milestone allocation (40%). The 3D asset adjustment credit has been applied directly to reduce the net amount due."}'::jsonb,
    0, true, false
  ),
  (
    '53000000-0000-4000-8000-000000000005',
    '51000000-0000-4000-8000-000000000002',
    'payment-details', 'payment_details', 'Payment Instructions',
    '{"body":"Qatar National Bank (QNB) - Nous LLC - IBAN QA75QNBA000000000260242198001 - SWIFT QNBAQAQAXXX"}'::jsonb,
    1, true, false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.project_costs (
    id, client_project_id, vendor_id, cost_type, status, reference,
    description, currency, subtotal_minor, tax_minor, total_minor,
    expense_date, due_date, approved_at
  ) VALUES (
    '60000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    'freelancer', 'paid', 'DEMO-PHOTO-COST-001',
    'Full-day studio photographer fee', 'QAR', 150000, 0, 150000,
    CURRENT_DATE, CURRENT_DATE + 3, now()
  ) ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    subtotal_minor = EXCLUDED.subtotal_minor,
    total_minor = EXCLUDED.total_minor,
    due_date = EXCLUDED.due_date;

  INSERT INTO public.project_cost_items (
    id, project_cost_id, sort_order, description, quantity,
    unit_cost_minor, total_minor
  ) VALUES (
    '61000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001', 0,
    'Full-day studio photography', 1, 150000, 150000
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.outgoing_payments (
    id, vendor_id, client_project_id, currency, amount_minor,
    payment_date, method, reference, status, notes
  ) VALUES (
    '62000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'QAR', 150000, CURRENT_DATE, 'bank_transfer',
    'DEMO-OUT-001', 'confirmed', 'Demo freelancer payment.'
  ) ON CONFLICT (id) DO UPDATE SET
    amount_minor = EXCLUDED.amount_minor,
    status = EXCLUDED.status;

  INSERT INTO public.outgoing_payment_allocations (
    id, payment_id, project_cost_id, amount_minor
  ) VALUES (
    '63000000-0000-4000-8000-000000000001',
    '62000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001', 150000
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.reminders (
    id, reminder_type, title, details, customer_id, client_project_id,
    vendor_id, document_id, project_cost_id, due_at, remind_before, status
  ) VALUES
  (
    '70000000-0000-4000-8000-000000000001',
    'document_follow_up', 'Follow up on product photography quotation',
    'Check quotation approval and confirm the studio date.',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    NULL, '50000000-0000-4000-8000-000000000001', NULL,
    now() + INTERVAL '3 days', INTERVAL '1 day', 'scheduled'
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    'meeting', 'Elite Collection production planning',
    'Confirm products, colour variants, styling and delivery requirements.',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001', NULL, NULL,
    now() + INTERVAL '7 days', INTERVAL '1 day', 'scheduled'
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    details = EXCLUDED.details,
    due_at = EXCLUDED.due_at,
    status = 'scheduled';
END;
$$;

COMMIT;

-- Expected visible records after the seed:
--   Customer: Elite Collection
--   Projects: Elite Product Photography; Elite Website & Admin Portal
--   Drafts: QAR 4,000 quotation; QAR 11,040 invoice after QAR 800 credit
--   Vendor cost/payment: QAR 1,500
--   Reminders: quotation follow-up and production-planning meeting
