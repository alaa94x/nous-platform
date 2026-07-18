-- Nous document draft workflow
-- Requires: 017_document_automation_foundation.sql and
--           018_document_operations_extensions.sql

-- Seed the two visual identities as published template versions. Project
-- content is stored in revision sections and line items, not inside fixed HTML.
INSERT INTO public.document_templates (kind, name, slug, description, locale, state)
VALUES
  ('quotation', 'Nous Quotation', 'nous-quotation', 'White-paper quotation identity', 'en', 'published'),
  ('invoice', 'Nous Invoice', 'nous-invoice', 'White-paper invoice identity', 'en', 'published')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  state = 'published';

INSERT INTO public.document_template_versions (
  template_id, version_number, html_template, css_template,
  variable_schema, block_schema, design_tokens, checksum_sha256,
  change_note, is_published, published_at
)
SELECT
  t.id,
  1,
  '<!doctype html><html><head><meta charset="utf-8"></head><body>{{document_body}}</body></html>',
  ':root{--paper:#fff;--ink:#0e1210;--pine:#084734;--lime:#cef17b}body{margin:0;background:var(--paper);color:var(--ink)}',
  '{"customer":true,"project":true,"dates":true,"currency":true}'::jsonb,
  '{"sections":"repeatable","line_items":"repeatable","reorder":true,"visibility":true}'::jsonb,
  '{"paper":"#ffffff","ink":"#0e1210","pine":"#084734","lime":"#cef17b"}'::jsonb,
  encode(digest(t.slug || ':v1:flexible-sections', 'sha256'), 'hex'),
  'Initial flexible section builder identity',
  true,
  now()
FROM public.document_templates t
WHERE t.slug IN ('nous-quotation', 'nous-invoice')
ON CONFLICT (template_id, version_number) DO NOTHING;

CREATE OR REPLACE FUNCTION public.save_document_draft(
  p_document_id UUID,
  p_kind public.document_kind,
  p_issuer_profile_id UUID,
  p_payment_account_id UUID,
  p_customer_id UUID,
  p_customer_contact_id UUID,
  p_client_project_id UUID,
  p_title TEXT,
  p_subtitle TEXT,
  p_currency TEXT,
  p_issue_date DATE,
  p_valid_until DATE,
  p_due_date DATE,
  p_lines JSONB,
  p_sections JSONB,
  p_calculation JSONB,
  p_change_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_document_id UUID;
  target_revision_id UUID;
  target_template_version_id UUID;
  next_revision INTEGER;
  project_customer_id UUID;
  line_count INTEGER;
BEGIN
  IF NOT public.current_user_has_permission('documents.manage') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  IF p_kind NOT IN ('quotation', 'invoice') THEN
    RAISE EXCEPTION 'Unsupported document kind' USING ERRCODE = '23514';
  END IF;
  IF char_length(p_currency) <> 3 THEN
    RAISE EXCEPTION 'Currency must use a three-letter code' USING ERRCODE = '23514';
  END IF;
  IF NULLIF(trim(p_title), '') IS NULL THEN
    RAISE EXCEPTION 'Document title is required' USING ERRCODE = '23514';
  END IF;
  IF jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 THEN
    RAISE EXCEPTION 'At least one line item is required' USING ERRCODE = '23514';
  END IF;
  IF jsonb_typeof(p_sections) <> 'array' THEN
    RAISE EXCEPTION 'Sections must be an array' USING ERRCODE = '23514';
  END IF;

  SELECT customer_id INTO project_customer_id
  FROM public.client_projects
  WHERE id = p_client_project_id;

  IF project_customer_id IS NULL OR project_customer_id <> p_customer_id THEN
    RAISE EXCEPTION 'Project and customer do not match' USING ERRCODE = '23514';
  END IF;

  SELECT dtv.id INTO target_template_version_id
  FROM public.document_template_versions dtv
  JOIN public.document_templates dt ON dt.id = dtv.template_id
  WHERE dt.kind = p_kind AND dt.state = 'published' AND dtv.is_published = true
  ORDER BY dtv.version_number DESC
  LIMIT 1;

  IF target_template_version_id IS NULL THEN
    RAISE EXCEPTION 'No published template is available for %', p_kind USING ERRCODE = '23503';
  END IF;

  IF p_document_id IS NULL THEN
    INSERT INTO public.documents (
      kind, issuer_profile_id, payment_account_id, customer_id,
      customer_contact_id, client_project_id, status, currency,
      issue_date, valid_until, due_date, created_by
    ) VALUES (
      p_kind, p_issuer_profile_id, p_payment_account_id, p_customer_id,
      p_customer_contact_id, p_client_project_id, 'draft', upper(p_currency),
      p_issue_date, p_valid_until, p_due_date, auth.uid()
    ) RETURNING id INTO target_document_id;
  ELSE
    SELECT id INTO target_document_id
    FROM public.documents
    WHERE id = p_document_id
      AND kind = p_kind
      AND customer_id = p_customer_id
      AND client_project_id = p_client_project_id
      AND status = 'draft'
    FOR UPDATE;

    IF target_document_id IS NULL THEN
      RAISE EXCEPTION 'Only the matching draft document may be revised' USING ERRCODE = '23514';
    END IF;

    UPDATE public.documents SET
      issuer_profile_id = p_issuer_profile_id,
      payment_account_id = p_payment_account_id,
      customer_contact_id = p_customer_contact_id,
      currency = upper(p_currency),
      issue_date = p_issue_date,
      valid_until = p_valid_until,
      due_date = p_due_date
    WHERE id = target_document_id;
  END IF;

  SELECT COALESCE(MAX(revision_number), 0) + 1 INTO next_revision
  FROM public.document_revisions
  WHERE document_id = target_document_id;

  INSERT INTO public.document_revisions (
    document_id, revision_number, template_version_id, title, subtitle,
    customer_snapshot, issuer_snapshot, project_snapshot, content_data,
    terms_data, calculation_data, subtotal_minor, line_discount_minor,
    document_discount_minor, tax_minor, total_minor, change_note, created_by
  )
  SELECT
    target_document_id,
    next_revision,
    target_template_version_id,
    trim(p_title),
    NULLIF(trim(p_subtitle), ''),
    to_jsonb(c),
    to_jsonb(i),
    to_jsonb(cp),
    jsonb_build_object('sections', p_sections),
    '{}'::jsonb,
    p_calculation,
    COALESCE((p_calculation ->> 'subtotalMinor')::BIGINT, 0),
    COALESCE((p_calculation ->> 'lineDiscountMinor')::BIGINT, 0),
    COALESCE((p_calculation ->> 'documentDiscountMinor')::BIGINT, 0),
    COALESCE((p_calculation ->> 'taxMinor')::BIGINT, 0),
    COALESCE((p_calculation ->> 'totalMinor')::BIGINT, 0),
    NULLIF(trim(p_change_note), ''),
    auth.uid()
  FROM public.customers c
  CROSS JOIN public.issuer_profiles i
  CROSS JOIN public.client_projects cp
  WHERE c.id = p_customer_id
    AND i.id = p_issuer_profile_id
    AND cp.id = p_client_project_id
  RETURNING id INTO target_revision_id;

  INSERT INTO public.document_line_items (
    revision_id, sort_order, line_type, title, description, quantity,
    unit_price_minor, discount_type, discount_value, tax_rate,
    subtotal_minor, discount_minor, tax_minor, total_minor, metadata
  )
  SELECT
    target_revision_id,
    line.ordinality - 1,
    COALESCE(line.value ->> 'type', 'charge'),
    trim(line.value ->> 'title'),
    NULLIF(trim(line.value ->> 'description'), ''),
    COALESCE((line.value ->> 'quantity')::NUMERIC, 1),
    COALESCE((line.value ->> 'unitPriceMinor')::BIGINT, 0),
    NULLIF(line.value #>> '{discount,type}', ''),
    COALESCE((line.value #>> '{discount,value}')::NUMERIC, 0),
    COALESCE((line.value ->> 'taxRateBps')::NUMERIC, 0) / 100,
    COALESCE((line.value ->> 'subtotalMinor')::BIGINT, 0),
    COALESCE((line.value ->> 'discountMinor')::BIGINT, 0),
    COALESCE((line.value ->> 'taxMinor')::BIGINT, 0),
    COALESCE((line.value ->> 'totalMinor')::BIGINT, 0),
    '{}'::jsonb
  FROM jsonb_array_elements(p_lines) WITH ORDINALITY AS line(value, ordinality);

  GET DIAGNOSTICS line_count = ROW_COUNT;
  IF line_count = 0 THEN
    RAISE EXCEPTION 'At least one line item is required' USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.document_revision_sections (
    revision_id, section_key, block_type, heading, content,
    sort_order, is_visible, page_break_before
  )
  SELECT
    target_revision_id,
    COALESCE(NULLIF(section.value ->> 'key', ''), 'section-' || section.ordinality),
    COALESCE(NULLIF(section.value ->> 'blockType', ''), 'rich_text'),
    NULLIF(trim(section.value ->> 'heading'), ''),
    COALESCE(section.value -> 'content', '{}'::jsonb),
    section.ordinality - 1,
    COALESCE((section.value ->> 'isVisible')::BOOLEAN, true),
    COALESCE((section.value ->> 'pageBreakBefore')::BOOLEAN, false)
  FROM jsonb_array_elements(p_sections) WITH ORDINALITY AS section(value, ordinality);

  UPDATE public.documents
  SET current_revision_id = target_revision_id
  WHERE id = target_document_id;

  RETURN jsonb_build_object(
    'documentId', target_document_id,
    'revisionId', target_revision_id,
    'revisionNumber', next_revision
  );
END;
$$;

REVOKE ALL ON FUNCTION public.save_document_draft(
  UUID, public.document_kind, UUID, UUID, UUID, UUID, UUID, TEXT, TEXT,
  TEXT, DATE, DATE, DATE, JSONB, JSONB, JSONB, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_document_draft(
  UUID, public.document_kind, UUID, UUID, UUID, UUID, UUID, TEXT, TEXT,
  TEXT, DATE, DATE, DATE, JSONB, JSONB, JSONB, TEXT
) TO authenticated;
