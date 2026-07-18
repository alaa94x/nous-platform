import type { Json } from './types'

export type DocumentKind = 'quotation' | 'invoice'
export type TemplateState = 'draft' | 'published' | 'archived'
export type VendorKind = 'freelancer' | 'company' | 'supplier'

export interface CustomerRow {
  id: string
  source_contact_id: string | null
  display_name: string
  legal_name: string | null
  registration_number: string | null
  tax_number: string | null
  email: string | null
  phone: string | null
  billing_address: Json
  default_currency: string
  payment_terms_days: number
  notes: string | null
  active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ClientProjectRow {
  id: string
  customer_id: string
  portfolio_project_id: string | null
  code: string | null
  name: string
  description: string | null
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  currency: string
  project_manager_id: string | null
  start_date: string | null
  target_end_date: string | null
  completed_at: string | null
  record_origin: 'current' | 'historical_manual'
  original_created_at: string | null
  reminders_enabled: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type DocumentSectionBlockType =
  | 'heading'
  | 'rich_text'
  | 'key_value'
  | 'line_items'
  | 'terms'
  | 'milestones'
  | 'signature'
  | 'payment_details'
  | 'page_break'
  | 'custom'

export interface DocumentRevisionSectionRow {
  id: string
  revision_id: string
  section_key: string
  block_type: DocumentSectionBlockType
  heading: string | null
  content: Json
  sort_order: number
  is_visible: boolean
  page_break_before: boolean
  created_at: string
  updated_at: string
}

export interface CreditNoteRow {
  id: string
  invoice_document_id: string
  template_version_id: string
  credit_number: string | null
  status: 'draft' | 'approved' | 'issued' | 'sent' | 'partially_refunded' | 'refunded' | 'void'
  reason: string
  currency: string
  amount_minor: number
  issue_date: string | null
  content_data: Json
  customer_snapshot: Json
  issuer_snapshot: Json
  project_snapshot: Json
  resolved_html: string | null
  html_checksum_sha256: string | null
  pdf_storage_path: string | null
  pdf_checksum_sha256: string | null
  approved_by: string | null
  approved_at: string | null
  issued_by: string | null
  issued_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ReminderRow {
  id: string
  reminder_type: 'client_payment_due' | 'vendor_payment_due' | 'meeting' | 'document_follow_up' | 'document_send' | 'custom'
  title: string
  details: string | null
  customer_id: string | null
  client_project_id: string | null
  vendor_id: string | null
  document_id: string | null
  project_cost_id: string | null
  due_at: string
  timezone: string
  remind_before: string
  recurrence_rule: string | null
  status: 'scheduled' | 'snoozed' | 'completed' | 'cancelled'
  snoozed_until: string | null
  completed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface VendorRow {
  id: string
  kind: VendorKind
  display_name: string
  legal_name: string | null
  registration_number: string | null
  email: string | null
  phone: string | null
  address: Json
  payment_details: Json
  notes: string | null
  active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DocumentTemplateRow {
  id: string
  kind: DocumentKind
  name: string
  slug: string
  description: string | null
  locale: string
  state: TemplateState
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DocumentTemplateVersionRow {
  id: string
  template_id: string
  version_number: number
  html_template: string
  css_template: string
  variable_schema: Json
  block_schema: Json
  assets_manifest: Json
  design_tokens: Json
  checksum_sha256: string
  change_note: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
  published_at: string | null
}

export interface DocumentRow {
  id: string
  kind: DocumentKind
  document_number: string | null
  issuer_profile_id: string
  payment_account_id: string | null
  customer_id: string
  customer_contact_id: string | null
  client_project_id: string
  source_document_id: string | null
  duplicated_from_id: string | null
  current_revision_id: string | null
  status: string
  currency: string
  issue_date: string | null
  valid_until: string | null
  due_date: string | null
  approved_by: string | null
  approved_at: string | null
  issued_by: string | null
  issued_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DocumentRevisionRow {
  id: string
  document_id: string
  revision_number: number
  template_version_id: string
  title: string
  subtitle: string | null
  customer_snapshot: Json
  issuer_snapshot: Json
  project_snapshot: Json
  content_data: Json
  terms_data: Json
  calculation_data: Json
  subtotal_minor: number
  line_discount_minor: number
  document_discount_minor: number
  tax_minor: number
  total_minor: number
  change_note: string | null
  is_locked: boolean
  locked_at: string | null
  created_by: string | null
  created_at: string
}

export interface DocumentLineItemRow {
  id: string
  revision_id: string
  sort_order: number
  line_type: 'charge' | 'credit' | 'informational'
  title: string
  description: string | null
  quantity: number
  unit_price_minor: number
  discount_type: 'fixed' | 'percentage' | null
  discount_value: number
  tax_rate: number
  subtotal_minor: number
  discount_minor: number
  tax_minor: number
  total_minor: number
  metadata: Json
  created_at: string
}

export interface DocumentSnapshotRow {
  id: string
  document_id: string
  revision_id: string
  template_version_id: string
  render_payload: Json
  resolved_html: string
  html_checksum_sha256: string
  payload_checksum_sha256: string
  pdf_storage_path: string | null
  pdf_checksum_sha256: string | null
  renderer_version: string | null
  locked_by: string | null
  locked_at: string
}

export interface ProjectCostRow {
  id: string
  client_project_id: string
  vendor_id: string | null
  cost_type: 'freelancer' | 'vendor' | 'expense' | 'internal'
  status: 'draft' | 'submitted' | 'approved' | 'partially_paid' | 'paid' | 'void'
  reference: string | null
  description: string
  currency: string
  subtotal_minor: number
  tax_minor: number
  total_minor: number
  expense_date: string
  due_date: string | null
  receipt_path: string | null
  approved_by: string | null
  approved_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}
