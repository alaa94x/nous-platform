-- Nous document operations extensions
-- Requires: 017_document_automation_foundation.sql
-- Adds flexible sections, manual historical records, credit/refund handling,
-- and Telegram-ready reminders.

-- ── Permissions ─────────────────────────────────────────────────────────────

INSERT INTO public.permissions (key, description) VALUES
  ('history.manage',   'Add and update manually entered historical project records'),
  ('refunds.manage',   'Create credit notes and record customer refunds'),
  ('reminders.read',   'View reminders and notification delivery history'),
  ('reminders.manage', 'Create reminders and manage notification preferences')
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.key = 'super_admin'
  AND p.key IN ('history.manage', 'refunds.manage', 'reminders.read', 'reminders.manage')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN ('history.manage', 'refunds.manage', 'reminders.read', 'reminders.manage')
WHERE r.key = 'finance_admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN ('history.manage', 'reminders.read', 'reminders.manage')
WHERE r.key = 'project_manager'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key = 'reminders.read'
WHERE r.key IN ('approver', 'viewer')
ON CONFLICT DO NOTHING;

-- ── Manual historical projects ──────────────────────────────────────────────

ALTER TABLE public.client_projects
  ADD COLUMN IF NOT EXISTS record_origin TEXT NOT NULL DEFAULT 'current'
    CHECK (record_origin IN ('current', 'historical_manual')),
  ADD COLUMN IF NOT EXISTS original_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.project_attachments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  category          TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN ('quotation', 'invoice', 'receipt', 'contract', 'brief', 'delivery', 'other')),
  title             TEXT NOT NULL,
  storage_path      TEXT NOT NULL,
  original_filename TEXT,
  mime_type         TEXT,
  file_size_bytes   BIGINT CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  document_date     DATE,
  notes             TEXT,
  uploaded_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Flexible document composition ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_revision_sections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id       UUID NOT NULL REFERENCES public.document_revisions(id) ON DELETE CASCADE,
  section_key       TEXT NOT NULL,
  block_type        TEXT NOT NULL DEFAULT 'rich_text'
    CHECK (block_type IN (
      'heading', 'rich_text', 'key_value', 'line_items', 'terms', 'milestones',
      'signature', 'payment_details', 'page_break', 'custom'
    )),
  heading           TEXT,
  content           JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_visible        BOOLEAN NOT NULL DEFAULT true,
  page_break_before BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (revision_id, section_key)
);

CREATE INDEX IF NOT EXISTS document_revision_sections_order_idx
  ON public.document_revision_sections (revision_id, sort_order, created_at);

-- ── Credit notes and refunds ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.credit_note_number_sequences (
  issuer_profile_id UUID NOT NULL REFERENCES public.issuer_profiles(id) ON DELETE RESTRICT,
  sequence_year     INTEGER NOT NULL,
  prefix            TEXT NOT NULL DEFAULT 'CRN',
  next_value        BIGINT NOT NULL DEFAULT 1 CHECK (next_value > 0),
  padding           INTEGER NOT NULL DEFAULT 4 CHECK (padding BETWEEN 3 AND 10),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (issuer_profile_id, sequence_year)
);

CREATE TABLE IF NOT EXISTS public.credit_notes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_document_id   UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  template_version_id   UUID NOT NULL REFERENCES public.document_template_versions(id) ON DELETE RESTRICT,
  credit_number         TEXT,
  status                TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'issued', 'sent', 'partially_refunded', 'refunded', 'void')),
  reason                TEXT NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(currency) = 3),
  amount_minor          BIGINT NOT NULL CHECK (amount_minor > 0),
  issue_date            DATE,
  content_data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  customer_snapshot     JSONB NOT NULL DEFAULT '{}'::jsonb,
  issuer_snapshot       JSONB NOT NULL DEFAULT '{}'::jsonb,
  project_snapshot      JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved_html         TEXT,
  html_checksum_sha256  TEXT,
  pdf_storage_path      TEXT,
  pdf_checksum_sha256   TEXT,
  approved_by           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at           TIMESTAMPTZ,
  issued_by             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at             TIMESTAMPTZ,
  created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (invoice_document_id, credit_number)
);

CREATE UNIQUE INDEX IF NOT EXISTS credit_notes_number_unique
  ON public.credit_notes (credit_number)
  WHERE credit_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.next_credit_note_number(
  target_issuer UUID,
  target_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq_value BIGINT;
  seq_prefix TEXT;
  seq_padding INTEGER;
BEGIN
  IF NOT public.current_user_has_permission('refunds.manage') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.credit_note_number_sequences (
    issuer_profile_id, sequence_year, prefix, next_value, padding
  ) VALUES (target_issuer, target_year, 'CRN', 1, 4)
  ON CONFLICT (issuer_profile_id, sequence_year) DO NOTHING;

  UPDATE public.credit_note_number_sequences
  SET next_value = next_value + 1, updated_at = now()
  WHERE issuer_profile_id = target_issuer AND sequence_year = target_year
  RETURNING next_value - 1, prefix, padding
  INTO seq_value, seq_prefix, seq_padding;

  RETURN format('%s-%s-%s', seq_prefix, target_year, lpad(seq_value::TEXT, seq_padding, '0'));
END;
$$;

REVOKE ALL ON FUNCTION public.next_credit_note_number(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_credit_note_number(UUID, INTEGER) TO authenticated;

CREATE TABLE IF NOT EXISTS public.customer_refunds (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_id    UUID NOT NULL REFERENCES public.credit_notes(id) ON DELETE RESTRICT,
  customer_id       UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  client_project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE RESTRICT,
  amount_minor      BIGINT NOT NULL CHECK (amount_minor > 0),
  currency          TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(currency) = 3),
  refund_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  method            TEXT,
  reference         TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'failed', 'reversed')),
  notes             TEXT,
  recorded_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.guard_customer_refund_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  credit_amount BIGINT;
  refunded_amount BIGINT;
BEGIN
  SELECT amount_minor INTO credit_amount
  FROM public.credit_notes
  WHERE id = NEW.credit_note_id
  FOR UPDATE;

  IF credit_amount IS NULL THEN
    RAISE EXCEPTION 'Credit note not found' USING ERRCODE = '23503';
  END IF;

  SELECT COALESCE(SUM(amount_minor), 0) INTO refunded_amount
  FROM public.customer_refunds
  WHERE credit_note_id = NEW.credit_note_id
    AND status = 'confirmed'
    AND id <> NEW.id;

  IF NEW.status = 'confirmed' AND refunded_amount + NEW.amount_minor > credit_amount THEN
    RAISE EXCEPTION 'Confirmed refunds cannot exceed the credit note amount' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_customer_refund_total_trigger ON public.customer_refunds;
CREATE TRIGGER guard_customer_refund_total_trigger
BEFORE INSERT OR UPDATE ON public.customer_refunds
FOR EACH ROW EXECUTE FUNCTION public.guard_customer_refund_total();

-- ── Reminders and Telegram delivery ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notification_destinations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel        TEXT NOT NULL CHECK (channel IN ('telegram')),
  name           TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  enabled        BOOLEAN NOT NULL DEFAULT true,
  preferences    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel, destination_id)
);

COMMENT ON TABLE public.notification_destinations IS
  'Stores Telegram chat IDs and preferences only. Bot tokens remain in server environment secrets.';

CREATE TABLE IF NOT EXISTS public.reminders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_type     TEXT NOT NULL
    CHECK (reminder_type IN (
      'client_payment_due', 'vendor_payment_due', 'meeting',
      'document_follow_up', 'document_send', 'custom'
    )),
  title             TEXT NOT NULL,
  details           TEXT,
  customer_id       UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  client_project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
  vendor_id         UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  document_id       UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  project_cost_id   UUID REFERENCES public.project_costs(id) ON DELETE CASCADE,
  due_at            TIMESTAMPTZ NOT NULL,
  timezone          TEXT NOT NULL DEFAULT 'Asia/Qatar',
  remind_before     INTERVAL NOT NULL DEFAULT INTERVAL '1 day',
  recurrence_rule   TEXT,
  status            TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'snoozed', 'completed', 'cancelled')),
  snoozed_until     TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (snoozed_until IS NULL OR status = 'snoozed')
);

CREATE INDEX IF NOT EXISTS reminders_due_idx
  ON public.reminders (status, due_at)
  WHERE status IN ('scheduled', 'snoozed');

CREATE TABLE IF NOT EXISTS public.reminder_deliveries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id         UUID NOT NULL REFERENCES public.reminders(id) ON DELETE CASCADE,
  destination_id      UUID NOT NULL REFERENCES public.notification_destinations(id) ON DELETE RESTRICT,
  scheduled_for       TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  attempt_count       INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  provider_message_id TEXT,
  last_error          TEXT,
  sent_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reminder_id, destination_id, scheduled_for)
);

-- ── Triggers, audit and row-level access ────────────────────────────────────

DROP TRIGGER IF EXISTS protect_locked_revision_sections ON public.document_revision_sections;
CREATE TRIGGER protect_locked_revision_sections
BEFORE INSERT OR UPDATE OR DELETE ON public.document_revision_sections
FOR EACH ROW EXECUTE FUNCTION public.prevent_locked_revision_child_change();

DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'document_revision_sections', 'credit_notes', 'customer_refunds',
    'notification_destinations', 'reminders', 'reminder_deliveries'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      table_name, table_name
    );
  END LOOP;
END $$;

DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'project_attachments', 'document_revision_sections', 'credit_notes',
    'customer_refunds', 'notification_destinations', 'reminders', 'reminder_deliveries'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.record_activity()',
      table_name, table_name
    );
  END LOOP;
END $$;

ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_revision_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_note_number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_attachments_read ON public.project_attachments;
DROP POLICY IF EXISTS project_attachments_write ON public.project_attachments;
CREATE POLICY project_attachments_read ON public.project_attachments
FOR SELECT TO authenticated USING (public.current_user_has_permission('projects.read'));
CREATE POLICY project_attachments_write ON public.project_attachments
FOR ALL TO authenticated
USING (public.current_user_has_permission('history.manage'))
WITH CHECK (public.current_user_has_permission('history.manage'));

DROP POLICY IF EXISTS document_revision_sections_read ON public.document_revision_sections;
DROP POLICY IF EXISTS document_revision_sections_write ON public.document_revision_sections;
CREATE POLICY document_revision_sections_read ON public.document_revision_sections
FOR SELECT TO authenticated USING (public.current_user_has_permission('documents.read'));
CREATE POLICY document_revision_sections_write ON public.document_revision_sections
FOR ALL TO authenticated
USING (public.current_user_has_permission('documents.manage'))
WITH CHECK (public.current_user_has_permission('documents.manage'));

DROP POLICY IF EXISTS credit_notes_read ON public.credit_notes;
DROP POLICY IF EXISTS credit_notes_write ON public.credit_notes;
CREATE POLICY credit_notes_read ON public.credit_notes
FOR SELECT TO authenticated USING (public.current_user_has_permission('documents.read'));
CREATE POLICY credit_notes_write ON public.credit_notes
FOR ALL TO authenticated
USING (public.current_user_has_permission('refunds.manage'))
WITH CHECK (public.current_user_has_permission('refunds.manage'));

DROP POLICY IF EXISTS credit_note_sequences_read ON public.credit_note_number_sequences;
CREATE POLICY credit_note_sequences_read ON public.credit_note_number_sequences
FOR SELECT TO authenticated USING (public.current_user_has_permission('documents.read'));

DROP POLICY IF EXISTS customer_refunds_read ON public.customer_refunds;
DROP POLICY IF EXISTS customer_refunds_write ON public.customer_refunds;
CREATE POLICY customer_refunds_read ON public.customer_refunds
FOR SELECT TO authenticated USING (public.current_user_has_permission('payments.read'));
CREATE POLICY customer_refunds_write ON public.customer_refunds
FOR ALL TO authenticated
USING (public.current_user_has_permission('refunds.manage'))
WITH CHECK (public.current_user_has_permission('refunds.manage'));

DROP POLICY IF EXISTS notification_destinations_read ON public.notification_destinations;
DROP POLICY IF EXISTS notification_destinations_write ON public.notification_destinations;
CREATE POLICY notification_destinations_read ON public.notification_destinations
FOR SELECT TO authenticated USING (public.current_user_has_permission('reminders.read'));
CREATE POLICY notification_destinations_write ON public.notification_destinations
FOR ALL TO authenticated
USING (public.current_user_has_permission('reminders.manage'))
WITH CHECK (public.current_user_has_permission('reminders.manage'));

DROP POLICY IF EXISTS reminders_read ON public.reminders;
DROP POLICY IF EXISTS reminders_write ON public.reminders;
CREATE POLICY reminders_read ON public.reminders
FOR SELECT TO authenticated USING (public.current_user_has_permission('reminders.read'));
CREATE POLICY reminders_write ON public.reminders
FOR ALL TO authenticated
USING (public.current_user_has_permission('reminders.manage'))
WITH CHECK (public.current_user_has_permission('reminders.manage'));

DROP POLICY IF EXISTS reminder_deliveries_read ON public.reminder_deliveries;
DROP POLICY IF EXISTS reminder_deliveries_write ON public.reminder_deliveries;
CREATE POLICY reminder_deliveries_read ON public.reminder_deliveries
FOR SELECT TO authenticated USING (public.current_user_has_permission('reminders.read'));
CREATE POLICY reminder_deliveries_write ON public.reminder_deliveries
FOR ALL TO authenticated
USING (public.current_user_has_permission('reminders.manage'))
WITH CHECK (public.current_user_has_permission('reminders.manage'));
