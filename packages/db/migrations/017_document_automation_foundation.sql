-- Nous document automation foundation
-- Adds operational customers/projects, financial records, reusable document
-- templates, immutable snapshots, approvals, numbering, permissions and audit.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE public.document_kind AS ENUM ('quotation', 'invoice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.template_state AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.approval_state AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_direction AS ENUM ('incoming', 'outgoing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.vendor_kind AS ENUM ('freelancer', 'company', 'supplier');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Access control ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  is_system   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id       UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id    UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

INSERT INTO public.permissions (key, description) VALUES
  ('users.manage',       'Manage admin users and roles'),
  ('customers.read',     'View customers and contacts'),
  ('customers.manage',   'Create and update customers and contacts'),
  ('projects.read',      'View operational client projects'),
  ('projects.manage',    'Create and update operational client projects'),
  ('vendors.read',       'View vendors, freelancers and costs'),
  ('vendors.manage',     'Manage vendors, freelancers and costs'),
  ('documents.read',     'View quotations, invoices and previews'),
  ('documents.manage',   'Create and revise quotations and invoices'),
  ('documents.approve',  'Approve or reject documents'),
  ('documents.issue',    'Allocate official numbers and issue documents'),
  ('documents.send',     'Send documents to customers'),
  ('templates.read',     'View document templates'),
  ('templates.manage',   'Create and publish template versions'),
  ('payments.read',      'View incoming and outgoing payments'),
  ('payments.manage',    'Record and allocate payments'),
  ('reports.read',       'View project financial reports'),
  ('audit.read',         'View the activity and audit log'),
  ('finance.settings',   'Manage issuer and payment account settings')
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO public.roles (key, name, description) VALUES
  ('super_admin',     'Super Admin',     'Full administrative access'),
  ('finance_admin',   'Finance Admin',   'Financial documents, payments, costs and reports'),
  ('project_manager', 'Project Manager', 'Customers, projects and document preparation'),
  ('approver',        'Approver',        'Review, approve and issue documents'),
  ('viewer',          'Viewer',          'Read-only operational access')
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.key = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.key IN (
  'customers.read', 'customers.manage', 'projects.read', 'projects.manage',
  'vendors.read', 'vendors.manage', 'documents.read', 'documents.manage',
  'documents.approve', 'documents.issue', 'documents.send', 'templates.read',
  'payments.read', 'payments.manage', 'reports.read', 'audit.read', 'finance.settings'
) WHERE r.key = 'finance_admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.key IN (
  'customers.read', 'customers.manage', 'projects.read', 'projects.manage',
  'vendors.read', 'documents.read', 'documents.manage', 'templates.read', 'reports.read'
) WHERE r.key = 'project_manager'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.key IN (
  'customers.read', 'projects.read', 'vendors.read', 'documents.read',
  'documents.approve', 'documents.issue', 'documents.send', 'templates.read',
  'payments.read', 'reports.read', 'audit.read'
) WHERE r.key = 'approver'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.key IN (
  'customers.read', 'projects.read', 'vendors.read', 'documents.read',
  'templates.read', 'payments.read', 'reports.read'
) WHERE r.key = 'viewer'
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.current_user_has_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    JOIN public.user_roles ur ON ur.user_id = ap.id
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ap.id = auth.uid()
      AND ap.is_active = true
      AND p.key = required_permission
  );
$$;

REVOKE ALL ON FUNCTION public.current_user_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_has_permission(TEXT) TO authenticated;

-- Create profiles for existing and future authenticated users. Roles are
-- intentionally assigned separately; see 017_document_automation_bootstrap.md.
INSERT INTO public.admin_profiles (id, display_name)
SELECT id, COALESCE(raw_user_meta_data ->> 'full_name', email)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_admin_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_admin_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_profile();

-- ── Operational parties and projects ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.issuer_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name          TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  registration_number TEXT,
  tax_number          TEXT,
  email               TEXT,
  phone               TEXT,
  address             JSONB NOT NULL DEFAULT '{}'::jsonb,
  logo_asset_path     TEXT,
  stamp_asset_path    TEXT,
  default_currency    TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(default_currency) = 3),
  is_default          BOOLEAN NOT NULL DEFAULT false,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS issuer_profiles_one_default
  ON public.issuer_profiles (is_default) WHERE is_default = true;

CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_profile_id UUID NOT NULL REFERENCES public.issuer_profiles(id) ON DELETE CASCADE,
  account_name      TEXT NOT NULL,
  bank_name         TEXT NOT NULL,
  iban              TEXT,
  swift_code        TEXT,
  currency          TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(currency) = 3),
  is_default        BOOLEAN NOT NULL DEFAULT false,
  active            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_accounts_one_default_per_issuer
  ON public.payment_accounts (issuer_profile_id, currency) WHERE is_default = true;

CREATE TABLE IF NOT EXISTS public.customers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_contact_id   UUID UNIQUE REFERENCES public.contacts(id) ON DELETE SET NULL,
  display_name        TEXT NOT NULL,
  legal_name          TEXT,
  registration_number TEXT,
  tax_number          TEXT,
  email               TEXT,
  phone               TEXT,
  billing_address     JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_currency    TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(default_currency) = 3),
  payment_terms_days  INTEGER NOT NULL DEFAULT 0 CHECK (payment_terms_days >= 0),
  notes               TEXT,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  job_title   TEXT,
  email       TEXT,
  phone       TEXT,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS customer_contacts_one_primary
  ON public.customer_contacts (customer_id) WHERE is_primary = true;

CREATE TABLE IF NOT EXISTS public.client_projects (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id          UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  portfolio_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  code                 TEXT UNIQUE,
  name                 TEXT NOT NULL,
  description          TEXT,
  status               TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'cancelled')),
  currency             TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(currency) = 3),
  project_manager_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date           DATE,
  target_end_date      DATE,
  completed_at         TIMESTAMPTZ,
  created_by           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (target_end_date IS NULL OR start_date IS NULL OR target_end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.vendors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                public.vendor_kind NOT NULL DEFAULT 'freelancer',
  display_name        TEXT NOT NULL,
  legal_name          TEXT,
  registration_number TEXT,
  email               TEXT,
  phone               TEXT,
  address             JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_details     JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes               TEXT,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_vendors (
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  vendor_id  UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  role       TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, vendor_id)
);

-- ── Templates and documents ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        public.document_kind NOT NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  locale      TEXT NOT NULL DEFAULT 'en',
  state       public.template_state NOT NULL DEFAULT 'draft',
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_template_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id      UUID NOT NULL REFERENCES public.document_templates(id) ON DELETE RESTRICT,
  version_number   INTEGER NOT NULL CHECK (version_number > 0),
  html_template    TEXT NOT NULL,
  css_template     TEXT NOT NULL,
  variable_schema  JSONB NOT NULL DEFAULT '{}'::jsonb,
  block_schema     JSONB NOT NULL DEFAULT '{}'::jsonb,
  assets_manifest  JSONB NOT NULL DEFAULT '[]'::jsonb,
  design_tokens    JSONB NOT NULL DEFAULT '{}'::jsonb,
  checksum_sha256  TEXT NOT NULL,
  change_note      TEXT,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at     TIMESTAMPTZ,
  UNIQUE (template_id, version_number),
  UNIQUE (template_id, checksum_sha256)
);

CREATE TABLE IF NOT EXISTS public.documents (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                 public.document_kind NOT NULL,
  document_number      TEXT,
  issuer_profile_id    UUID NOT NULL REFERENCES public.issuer_profiles(id) ON DELETE RESTRICT,
  payment_account_id   UUID REFERENCES public.payment_accounts(id) ON DELETE SET NULL,
  customer_id          UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  customer_contact_id  UUID REFERENCES public.customer_contacts(id) ON DELETE SET NULL,
  client_project_id    UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE RESTRICT,
  source_document_id   UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  duplicated_from_id   UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  current_revision_id  UUID,
  status               TEXT NOT NULL DEFAULT 'draft',
  currency             TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(currency) = 3),
  issue_date           DATE,
  valid_until          DATE,
  due_date             DATE,
  approved_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at          TIMESTAMPTZ,
  issued_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at            TIMESTAMPTZ,
  created_by           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (kind = 'quotation' AND status IN ('draft','internal_review','approved','sent','viewed','accepted','rejected','expired','cancelled','superseded')) OR
    (kind = 'invoice' AND status IN ('draft','internal_review','approved','issued','sent','partially_paid','paid','overdue','void','written_off'))
  ),
  CHECK (valid_until IS NULL OR issue_date IS NULL OR valid_until >= issue_date),
  CHECK (due_date IS NULL OR issue_date IS NULL OR due_date >= issue_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS documents_number_unique
  ON public.documents (issuer_profile_id, document_number)
  WHERE document_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.document_revisions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id           UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  revision_number       INTEGER NOT NULL CHECK (revision_number > 0),
  template_version_id   UUID NOT NULL REFERENCES public.document_template_versions(id) ON DELETE RESTRICT,
  title                 TEXT NOT NULL,
  subtitle              TEXT,
  customer_snapshot     JSONB NOT NULL DEFAULT '{}'::jsonb,
  issuer_snapshot       JSONB NOT NULL DEFAULT '{}'::jsonb,
  project_snapshot      JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  terms_data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculation_data      JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtotal_minor        BIGINT NOT NULL DEFAULT 0,
  line_discount_minor   BIGINT NOT NULL DEFAULT 0,
  document_discount_minor BIGINT NOT NULL DEFAULT 0,
  tax_minor             BIGINT NOT NULL DEFAULT 0,
  total_minor           BIGINT NOT NULL DEFAULT 0,
  change_note           TEXT,
  is_locked             BOOLEAN NOT NULL DEFAULT false,
  locked_at             TIMESTAMPTZ,
  created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, revision_number),
  CHECK (subtotal_minor >= 0),
  CHECK (line_discount_minor >= 0),
  CHECK (document_discount_minor >= 0),
  CHECK (tax_minor >= 0),
  CHECK (total_minor >= 0),
  CHECK ((is_locked = false AND locked_at IS NULL) OR (is_locked = true AND locked_at IS NOT NULL))
);

ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_current_revision_id_fkey;
ALTER TABLE public.documents
  ADD CONSTRAINT documents_current_revision_id_fkey
  FOREIGN KEY (current_revision_id) REFERENCES public.document_revisions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.document_line_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id         UUID NOT NULL REFERENCES public.document_revisions(id) ON DELETE CASCADE,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  line_type           TEXT NOT NULL DEFAULT 'charge' CHECK (line_type IN ('charge', 'credit', 'informational')),
  title               TEXT NOT NULL,
  description         TEXT,
  quantity            NUMERIC(14,4) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit_price_minor    BIGINT NOT NULL DEFAULT 0 CHECK (unit_price_minor >= 0),
  discount_type       TEXT CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value      NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  tax_rate            NUMERIC(7,4) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
  subtotal_minor      BIGINT NOT NULL DEFAULT 0,
  discount_minor      BIGINT NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  tax_minor           BIGINT NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor         BIGINT NOT NULL DEFAULT 0,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_snapshots (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id          UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  revision_id          UUID NOT NULL UNIQUE REFERENCES public.document_revisions(id) ON DELETE RESTRICT,
  template_version_id  UUID NOT NULL REFERENCES public.document_template_versions(id) ON DELETE RESTRICT,
  render_payload       JSONB NOT NULL,
  resolved_html        TEXT NOT NULL,
  html_checksum_sha256 TEXT NOT NULL,
  payload_checksum_sha256 TEXT NOT NULL,
  pdf_storage_path     TEXT,
  pdf_checksum_sha256  TEXT,
  renderer_version     TEXT,
  locked_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  locked_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_approvals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  revision_id   UUID NOT NULL REFERENCES public.document_revisions(id) ON DELETE RESTRICT,
  state         public.approval_state NOT NULL DEFAULT 'pending',
  requested_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at    TIMESTAMPTZ,
  note          TEXT
);

CREATE TABLE IF NOT EXISTS public.document_status_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  note        TEXT,
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_deliveries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  snapshot_id   UUID NOT NULL REFERENCES public.document_snapshots(id) ON DELETE RESTRICT,
  channel       TEXT NOT NULL CHECK (channel IN ('email', 'download', 'share_link')),
  recipient     TEXT,
  provider      TEXT,
  provider_id   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'downloaded')),
  error_message TEXT,
  sent_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.document_number_sequences (
  issuer_profile_id UUID NOT NULL REFERENCES public.issuer_profiles(id) ON DELETE RESTRICT,
  kind              public.document_kind NOT NULL,
  sequence_year     INTEGER NOT NULL,
  prefix            TEXT NOT NULL,
  next_value        BIGINT NOT NULL DEFAULT 1 CHECK (next_value > 0),
  padding           INTEGER NOT NULL DEFAULT 4 CHECK (padding BETWEEN 3 AND 10),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (issuer_profile_id, kind, sequence_year)
);

-- ── Costs and payments ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.project_costs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE RESTRICT,
  vendor_id       UUID REFERENCES public.vendors(id) ON DELETE RESTRICT,
  cost_type       TEXT NOT NULL DEFAULT 'vendor' CHECK (cost_type IN ('freelancer', 'vendor', 'expense', 'internal')),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'partially_paid', 'paid', 'void')),
  reference       TEXT,
  description     TEXT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(currency) = 3),
  subtotal_minor  BIGINT NOT NULL DEFAULT 0 CHECK (subtotal_minor >= 0),
  tax_minor       BIGINT NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  total_minor     BIGINT NOT NULL DEFAULT 0 CHECK (total_minor >= 0),
  expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date        DATE,
  receipt_path    TEXT,
  approved_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_cost_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_cost_id  UUID NOT NULL REFERENCES public.project_costs(id) ON DELETE CASCADE,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  description      TEXT NOT NULL,
  quantity         NUMERIC(14,4) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit_cost_minor  BIGINT NOT NULL DEFAULT 0 CHECK (unit_cost_minor >= 0),
  total_minor      BIGINT NOT NULL DEFAULT 0 CHECK (total_minor >= 0)
);

CREATE TABLE IF NOT EXISTS public.customer_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  client_project_id UUID REFERENCES public.client_projects(id) ON DELETE RESTRICT,
  currency          TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(currency) = 3),
  amount_minor      BIGINT NOT NULL CHECK (amount_minor > 0),
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  method            TEXT,
  reference         TEXT,
  status            TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'reversed')),
  notes             TEXT,
  recorded_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoice_payment_allocations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id     UUID NOT NULL REFERENCES public.customer_payments(id) ON DELETE RESTRICT,
  document_id    UUID NOT NULL REFERENCES public.documents(id) ON DELETE RESTRICT,
  amount_minor   BIGINT NOT NULL CHECK (amount_minor > 0),
  allocated_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (payment_id, document_id)
);

CREATE TABLE IF NOT EXISTS public.outgoing_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         UUID REFERENCES public.vendors(id) ON DELETE RESTRICT,
  client_project_id UUID REFERENCES public.client_projects(id) ON DELETE RESTRICT,
  currency          TEXT NOT NULL DEFAULT 'QAR' CHECK (char_length(currency) = 3),
  amount_minor      BIGINT NOT NULL CHECK (amount_minor > 0),
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  method            TEXT,
  reference         TEXT,
  status            TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'reversed')),
  notes             TEXT,
  recorded_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.outgoing_payment_allocations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID NOT NULL REFERENCES public.outgoing_payments(id) ON DELETE RESTRICT,
  project_cost_id UUID NOT NULL REFERENCES public.project_costs(id) ON DELETE RESTRICT,
  amount_minor    BIGINT NOT NULL CHECK (amount_minor > 0),
  allocated_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (payment_id, project_cost_id)
);

-- ── Audit, immutability and numbering ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.activity_log (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  changes     JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_immutable_record_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% records are immutable', TG_TABLE_NAME USING ERRCODE = '55000';
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_locked_revision_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_locked THEN
    RAISE EXCEPTION 'Locked document revisions are immutable' USING ERRCODE = '55000';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_locked_revision_child_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  parent_revision_id UUID;
  parent_is_locked BOOLEAN;
BEGIN
  parent_revision_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.revision_id ELSE NEW.revision_id END;
  SELECT is_locked INTO parent_is_locked
  FROM public.document_revisions
  WHERE id = parent_revision_id;

  IF parent_is_locked THEN
    RAISE EXCEPTION 'Line items belonging to a locked revision are immutable' USING ERRCODE = '55000';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_document_current_revision()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  revision_document_id UUID;
BEGIN
  IF NEW.current_revision_id IS NULL THEN RETURN NEW; END IF;

  SELECT document_id INTO revision_document_id
  FROM public.document_revisions
  WHERE id = NEW.current_revision_id;

  IF revision_document_id IS DISTINCT FROM NEW.id THEN
    RAISE EXCEPTION 'Current revision must belong to the same document' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_document_snapshot()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  revision_record public.document_revisions%ROWTYPE;
BEGIN
  SELECT * INTO revision_record
  FROM public.document_revisions
  WHERE id = NEW.revision_id
  FOR UPDATE;

  IF NOT FOUND OR revision_record.document_id <> NEW.document_id THEN
    RAISE EXCEPTION 'Snapshot revision does not belong to the document' USING ERRCODE = '23514';
  END IF;
  IF revision_record.template_version_id <> NEW.template_version_id THEN
    RAISE EXCEPTION 'Snapshot template version must match the revision' USING ERRCODE = '23514';
  END IF;
  IF revision_record.is_locked = false THEN
    RAISE EXCEPTION 'A snapshot can only be created from a locked revision' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row_id TEXT;
  diff JSONB;
BEGIN
  row_id := COALESCE(to_jsonb(NEW) ->> 'id', to_jsonb(OLD) ->> 'id');
  diff := CASE
    WHEN TG_OP = 'INSERT' THEN jsonb_build_object('new', to_jsonb(NEW))
    WHEN TG_OP = 'DELETE' THEN jsonb_build_object('old', to_jsonb(OLD))
    ELSE jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  END;

  INSERT INTO public.activity_log (actor_id, action, entity_type, entity_id, changes)
  VALUES (auth.uid(), lower(TG_OP), TG_TABLE_NAME, row_id, diff);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_invoice_payment_allocation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  payment_record public.customer_payments%ROWTYPE;
  document_record public.documents%ROWTYPE;
  invoice_total BIGINT;
  payment_allocated BIGINT;
  invoice_allocated BIGINT;
BEGIN
  SELECT * INTO payment_record FROM public.customer_payments WHERE id = NEW.payment_id FOR UPDATE;
  SELECT * INTO document_record FROM public.documents WHERE id = NEW.document_id FOR UPDATE;

  IF payment_record.id IS NULL THEN
    RAISE EXCEPTION 'Payment not found' USING ERRCODE = '23503';
  END IF;
  IF document_record.id IS NULL OR document_record.kind <> 'invoice' THEN
    RAISE EXCEPTION 'Payments may only be allocated to invoices' USING ERRCODE = '23514';
  END IF;
  IF payment_record.status <> 'confirmed' THEN
    RAISE EXCEPTION 'Only confirmed payments may be allocated' USING ERRCODE = '23514';
  END IF;
  IF payment_record.customer_id <> document_record.customer_id THEN
    RAISE EXCEPTION 'Payment and invoice customers must match' USING ERRCODE = '23514';
  END IF;
  IF payment_record.currency <> document_record.currency THEN
    RAISE EXCEPTION 'Payment and invoice currencies must match' USING ERRCODE = '23514';
  END IF;
  IF document_record.status NOT IN ('issued','sent','partially_paid','paid','overdue') THEN
    RAISE EXCEPTION 'Payments may only be allocated to an issued invoice' USING ERRCODE = '23514';
  END IF;

  SELECT total_minor INTO invoice_total
  FROM public.document_revisions
  WHERE id = document_record.current_revision_id;

  SELECT COALESCE(sum(amount_minor), 0) INTO payment_allocated
  FROM public.invoice_payment_allocations
  WHERE payment_id = NEW.payment_id AND id <> COALESCE(NEW.id, gen_random_uuid());

  SELECT COALESCE(sum(amount_minor), 0) INTO invoice_allocated
  FROM public.invoice_payment_allocations
  WHERE document_id = NEW.document_id AND id <> COALESCE(NEW.id, gen_random_uuid());

  IF payment_allocated + NEW.amount_minor > payment_record.amount_minor THEN
    RAISE EXCEPTION 'Allocations exceed the payment amount' USING ERRCODE = '23514';
  END IF;
  IF invoice_total IS NULL OR invoice_allocated + NEW.amount_minor > invoice_total THEN
    RAISE EXCEPTION 'Allocations exceed the invoice total' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_outgoing_payment_allocation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  payment_record public.outgoing_payments%ROWTYPE;
  cost_record public.project_costs%ROWTYPE;
  payment_allocated BIGINT;
  cost_allocated BIGINT;
BEGIN
  SELECT * INTO payment_record FROM public.outgoing_payments WHERE id = NEW.payment_id FOR UPDATE;
  SELECT * INTO cost_record FROM public.project_costs WHERE id = NEW.project_cost_id FOR UPDATE;

  IF payment_record.id IS NULL OR cost_record.id IS NULL THEN
    RAISE EXCEPTION 'Outgoing payment or project cost not found' USING ERRCODE = '23503';
  END IF;
  IF payment_record.status <> 'confirmed' THEN
    RAISE EXCEPTION 'Only confirmed payments may be allocated' USING ERRCODE = '23514';
  END IF;
  IF cost_record.status NOT IN ('approved','partially_paid','paid') THEN
    RAISE EXCEPTION 'Payments may only be allocated to an approved cost' USING ERRCODE = '23514';
  END IF;
  IF payment_record.currency <> cost_record.currency THEN
    RAISE EXCEPTION 'Payment and cost currencies must match' USING ERRCODE = '23514';
  END IF;
  IF payment_record.vendor_id IS NOT NULL AND cost_record.vendor_id IS DISTINCT FROM payment_record.vendor_id THEN
    RAISE EXCEPTION 'Payment and cost vendors must match' USING ERRCODE = '23514';
  END IF;

  SELECT COALESCE(sum(amount_minor), 0) INTO payment_allocated
  FROM public.outgoing_payment_allocations
  WHERE payment_id = NEW.payment_id AND id <> COALESCE(NEW.id, gen_random_uuid());

  SELECT COALESCE(sum(amount_minor), 0) INTO cost_allocated
  FROM public.outgoing_payment_allocations
  WHERE project_cost_id = NEW.project_cost_id AND id <> COALESCE(NEW.id, gen_random_uuid());

  IF payment_allocated + NEW.amount_minor > payment_record.amount_minor THEN
    RAISE EXCEPTION 'Allocations exceed the outgoing payment amount' USING ERRCODE = '23514';
  END IF;
  IF cost_allocated + NEW.amount_minor > cost_record.total_minor THEN
    RAISE EXCEPTION 'Allocations exceed the approved cost total' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.next_document_number(
  target_issuer UUID,
  target_kind public.document_kind,
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
  IF NOT public.current_user_has_permission('documents.issue') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.document_number_sequences (
    issuer_profile_id, kind, sequence_year, prefix, next_value, padding
  ) VALUES (
    target_issuer,
    target_kind,
    target_year,
    CASE WHEN target_kind = 'quotation' THEN 'QTN' ELSE 'INV' END,
    1,
    4
  ) ON CONFLICT (issuer_profile_id, kind, sequence_year) DO NOTHING;

  UPDATE public.document_number_sequences
  SET next_value = next_value + 1, updated_at = now()
  WHERE issuer_profile_id = target_issuer
    AND kind = target_kind
    AND sequence_year = target_year
  RETURNING next_value - 1, prefix, padding
    INTO seq_value, seq_prefix, seq_padding;

  RETURN format('%s-%s-%s', seq_prefix, target_year, lpad(seq_value::TEXT, seq_padding, '0'));
END;
$$;

REVOKE ALL ON FUNCTION public.next_document_number(UUID, public.document_kind, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_document_number(UUID, public.document_kind, INTEGER) TO authenticated;

-- Updated-at triggers
DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'admin_profiles','issuer_profiles','payment_accounts','customers','customer_contacts',
    'client_projects','vendors','document_templates','documents','project_costs',
    'customer_payments','outgoing_payments'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', table_name, table_name);
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS immutable_document_snapshots ON public.document_snapshots;
CREATE TRIGGER immutable_document_snapshots
BEFORE UPDATE OR DELETE ON public.document_snapshots
FOR EACH ROW EXECUTE FUNCTION public.prevent_immutable_record_change();

DROP TRIGGER IF EXISTS protect_locked_document_revisions ON public.document_revisions;
CREATE TRIGGER protect_locked_document_revisions
BEFORE UPDATE OR DELETE ON public.document_revisions
FOR EACH ROW EXECUTE FUNCTION public.prevent_locked_revision_change();

DROP TRIGGER IF EXISTS protect_locked_document_line_items ON public.document_line_items;
CREATE TRIGGER protect_locked_document_line_items
BEFORE INSERT OR UPDATE OR DELETE ON public.document_line_items
FOR EACH ROW EXECUTE FUNCTION public.prevent_locked_revision_child_change();

DROP TRIGGER IF EXISTS validate_documents_current_revision ON public.documents;
CREATE TRIGGER validate_documents_current_revision
BEFORE INSERT OR UPDATE OF current_revision_id ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.validate_document_current_revision();

DROP TRIGGER IF EXISTS validate_document_snapshots_insert ON public.document_snapshots;
CREATE TRIGGER validate_document_snapshots_insert
BEFORE INSERT ON public.document_snapshots
FOR EACH ROW EXECUTE FUNCTION public.validate_document_snapshot();

DROP TRIGGER IF EXISTS validate_invoice_payment_allocations ON public.invoice_payment_allocations;
CREATE TRIGGER validate_invoice_payment_allocations
BEFORE INSERT OR UPDATE ON public.invoice_payment_allocations
FOR EACH ROW EXECUTE FUNCTION public.validate_invoice_payment_allocation();

DROP TRIGGER IF EXISTS validate_outgoing_payment_allocations ON public.outgoing_payment_allocations;
CREATE TRIGGER validate_outgoing_payment_allocations
BEFORE INSERT OR UPDATE ON public.outgoing_payment_allocations
FOR EACH ROW EXECUTE FUNCTION public.validate_outgoing_payment_allocation();

DROP TRIGGER IF EXISTS protect_published_template_versions ON public.document_template_versions;
CREATE TRIGGER protect_published_template_versions
BEFORE UPDATE OR DELETE ON public.document_template_versions
FOR EACH ROW WHEN (OLD.is_published = true)
EXECUTE FUNCTION public.prevent_immutable_record_change();

-- Record critical business changes. Asset snapshots and activity_log itself are
-- excluded because snapshots are immutable and recursive logging is undesirable.
DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'customers','customer_contacts','client_projects','vendors','project_vendors',
    'document_templates','document_template_versions','documents','document_revisions',
    'document_line_items','document_approvals','document_status_events','document_deliveries',
    'project_costs','project_cost_items','customer_payments','invoice_payment_allocations',
    'outgoing_payments','outgoing_payment_allocations'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.record_activity()', table_name, table_name);
  END LOOP;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS customers_display_name_idx ON public.customers (display_name);
CREATE INDEX IF NOT EXISTS client_projects_customer_idx ON public.client_projects (customer_id, status);
CREATE INDEX IF NOT EXISTS vendors_display_name_idx ON public.vendors (display_name);
CREATE INDEX IF NOT EXISTS documents_project_idx ON public.documents (client_project_id, kind, status);
CREATE INDEX IF NOT EXISTS documents_customer_idx ON public.documents (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS document_revisions_document_idx ON public.document_revisions (document_id, revision_number DESC);
CREATE INDEX IF NOT EXISTS document_line_items_revision_idx ON public.document_line_items (revision_id, sort_order);
CREATE INDEX IF NOT EXISTS project_costs_project_idx ON public.project_costs (client_project_id, status);
CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON public.activity_log (entity_type, entity_id, created_at DESC);

-- ── Row level security ───────────────────────────────────────────────────────

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_profiles_self_or_manager_read ON public.admin_profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR public.current_user_has_permission('users.manage'));
CREATE POLICY admin_profiles_manager_write ON public.admin_profiles
FOR ALL TO authenticated
USING (public.current_user_has_permission('users.manage'))
WITH CHECK (public.current_user_has_permission('users.manage'));

CREATE POLICY roles_authenticated_read ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY permissions_authenticated_read ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_authenticated_read ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY user_roles_self_or_manager_read ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_has_permission('users.manage'));
CREATE POLICY access_model_manager_write_roles ON public.roles FOR ALL TO authenticated
USING (public.current_user_has_permission('users.manage')) WITH CHECK (public.current_user_has_permission('users.manage'));
CREATE POLICY access_model_manager_write_permissions ON public.permissions FOR ALL TO authenticated
USING (public.current_user_has_permission('users.manage')) WITH CHECK (public.current_user_has_permission('users.manage'));
CREATE POLICY access_model_manager_write_role_permissions ON public.role_permissions FOR ALL TO authenticated
USING (public.current_user_has_permission('users.manage')) WITH CHECK (public.current_user_has_permission('users.manage'));
CREATE POLICY access_model_manager_write_user_roles ON public.user_roles FOR ALL TO authenticated
USING (public.current_user_has_permission('users.manage')) WITH CHECK (public.current_user_has_permission('users.manage'));

-- Compact policy creation for tables that share a permission boundary.
DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['customers','customer_contacts'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.current_user_has_permission(''customers.read''))', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_has_permission(''customers.manage'')) WITH CHECK (public.current_user_has_permission(''customers.manage''))', table_name || '_write', table_name);
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY['client_projects'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.current_user_has_permission(''projects.read''))', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_has_permission(''projects.manage'')) WITH CHECK (public.current_user_has_permission(''projects.manage''))', table_name || '_write', table_name);
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY['vendors','project_vendors','project_costs','project_cost_items','outgoing_payments','outgoing_payment_allocations'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.current_user_has_permission(''vendors.read''))', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_has_permission(''vendors.manage'')) WITH CHECK (public.current_user_has_permission(''vendors.manage''))', table_name || '_write', table_name);
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY['document_templates','document_template_versions'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.current_user_has_permission(''templates.read''))', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_has_permission(''templates.manage'')) WITH CHECK (public.current_user_has_permission(''templates.manage''))', table_name || '_write', table_name);
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY['documents','document_revisions','document_line_items','document_approvals','document_status_events','document_deliveries'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.current_user_has_permission(''documents.read''))', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_has_permission(''documents.manage'')) WITH CHECK (public.current_user_has_permission(''documents.manage''))', table_name || '_write', table_name);
  END LOOP;

  FOREACH table_name IN ARRAY ARRAY['customer_payments','invoice_payment_allocations'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.current_user_has_permission(''payments.read''))', table_name || '_read', table_name);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_has_permission(''payments.manage'')) WITH CHECK (public.current_user_has_permission(''payments.manage''))', table_name || '_write', table_name);
  END LOOP;
END $$;

CREATE POLICY issuer_profiles_read ON public.issuer_profiles FOR SELECT TO authenticated
USING (public.current_user_has_permission('documents.read'));
CREATE POLICY issuer_profiles_write ON public.issuer_profiles FOR ALL TO authenticated
USING (public.current_user_has_permission('finance.settings')) WITH CHECK (public.current_user_has_permission('finance.settings'));
CREATE POLICY payment_accounts_read ON public.payment_accounts FOR SELECT TO authenticated
USING (public.current_user_has_permission('documents.read'));
CREATE POLICY payment_accounts_write ON public.payment_accounts FOR ALL TO authenticated
USING (public.current_user_has_permission('finance.settings')) WITH CHECK (public.current_user_has_permission('finance.settings'));

CREATE POLICY document_snapshots_read ON public.document_snapshots FOR SELECT TO authenticated
USING (public.current_user_has_permission('documents.read'));
CREATE POLICY document_snapshots_insert ON public.document_snapshots FOR INSERT TO authenticated
WITH CHECK (public.current_user_has_permission('documents.issue'));
CREATE POLICY document_sequences_read ON public.document_number_sequences FOR SELECT TO authenticated
USING (public.current_user_has_permission('documents.read'));

CREATE POLICY activity_log_read ON public.activity_log FOR SELECT TO authenticated
USING (public.current_user_has_permission('audit.read'));

-- No UPDATE/DELETE policies are defined for snapshots or activity_log.
-- document_number_sequences may only be changed through next_document_number().
