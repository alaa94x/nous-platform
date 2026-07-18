export type DocumentKind = 'quotation' | 'invoice'
export type LineItemType = 'charge' | 'credit' | 'informational'
export type DiscountType = 'fixed' | 'percentage'

export type QuotationStatus =
  | 'draft'
  | 'internal_review'
  | 'approved'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | 'superseded'

export type InvoiceStatus =
  | 'draft'
  | 'internal_review'
  | 'approved'
  | 'issued'
  | 'sent'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'void'
  | 'written_off'

export type DocumentStatus = QuotationStatus | InvoiceStatus

export interface DiscountInput {
  type: DiscountType
  /** Fixed discounts use minor currency units. Percentage discounts use basis points (10,000 = 100%). */
  value: number
}

export interface LineItemInput {
  id?: string
  type?: LineItemType
  title: string
  description?: string
  quantity: number
  unitPriceMinor: number
  discount?: DiscountInput
  /** Basis points: 500 = 5%, 1,000 = 10%. */
  taxRateBps?: number
}

export interface CalculatedLineItem extends LineItemInput {
  type: LineItemType
  subtotalMinor: number
  discountMinor: number
  taxMinor: number
  totalMinor: number
}

export interface DocumentCalculationInput {
  lines: LineItemInput[]
  documentDiscount?: DiscountInput
}

export interface DocumentTotals {
  lines: CalculatedLineItem[]
  subtotalMinor: number
  lineDiscountMinor: number
  documentDiscountMinor: number
  taxMinor: number
  totalMinor: number
}

export interface ProjectFinancialInput {
  acceptedQuotationMinor?: number
  invoicedMinor: number
  collectedMinor: number
  approvedCostMinor: number
  paidCostMinor: number
}

export interface ProjectFinancialSummary extends Required<ProjectFinancialInput> {
  outstandingReceivablesMinor: number
  outstandingPayablesMinor: number
  invoicedProfitMinor: number
  cashProfitMinor: number
  invoicedMarginPercent: number | null
  cashMarginPercent: number | null
}
