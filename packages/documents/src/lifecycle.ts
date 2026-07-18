import type { DocumentKind, DocumentStatus, InvoiceStatus, QuotationStatus } from './types'

const quotationTransitions: Record<QuotationStatus, readonly QuotationStatus[]> = {
  draft: ['internal_review', 'cancelled'],
  internal_review: ['draft', 'approved', 'cancelled'],
  approved: ['sent', 'cancelled'],
  sent: ['viewed', 'accepted', 'rejected', 'expired', 'superseded'],
  viewed: ['accepted', 'rejected', 'expired', 'superseded'],
  accepted: ['superseded'],
  rejected: ['superseded'],
  expired: ['superseded'],
  cancelled: [],
  superseded: [],
}

const invoiceTransitions: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ['internal_review', 'void'],
  internal_review: ['draft', 'approved', 'void'],
  approved: ['issued', 'void'],
  issued: ['sent', 'partially_paid', 'paid', 'overdue', 'void'],
  sent: ['partially_paid', 'paid', 'overdue', 'void'],
  partially_paid: ['paid', 'overdue', 'void', 'written_off'],
  paid: [],
  overdue: ['partially_paid', 'paid', 'void', 'written_off'],
  void: [],
  written_off: [],
}

export function allowedDocumentTransitions(kind: 'quotation', status: QuotationStatus): readonly QuotationStatus[]
export function allowedDocumentTransitions(kind: 'invoice', status: InvoiceStatus): readonly InvoiceStatus[]
export function allowedDocumentTransitions(kind: DocumentKind, status: DocumentStatus): readonly DocumentStatus[] {
  return kind === 'quotation'
    ? quotationTransitions[status as QuotationStatus]
    : invoiceTransitions[status as InvoiceStatus]
}

export function canTransitionDocument(
  kind: DocumentKind,
  from: DocumentStatus,
  to: DocumentStatus,
): boolean {
  const allowed: readonly DocumentStatus[] = kind === 'quotation'
    ? quotationTransitions[from as QuotationStatus] ?? []
    : invoiceTransitions[from as InvoiceStatus] ?? []
  return allowed.includes(to)
}

export function assertDocumentTransition(
  kind: DocumentKind,
  from: DocumentStatus,
  to: DocumentStatus,
): void {
  if (!canTransitionDocument(kind, from, to)) {
    throw new Error(`Invalid ${kind} status transition: ${from} -> ${to}`)
  }
}
