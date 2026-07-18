import type {
  CalculatedLineItem,
  DiscountInput,
  DocumentCalculationInput,
  DocumentTotals,
  LineItemInput,
  ProjectFinancialInput,
  ProjectFinancialSummary,
} from './types'

const MAX_BASIS_POINTS = 10_000

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite, non-negative number`)
  }
}

function assertMinorUnits(value: number, label: string): void {
  assertFiniteNonNegative(value, label)
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${label} must be a safe integer in minor currency units`)
  }
}

function calculateDiscount(baseMinor: number, discount?: DiscountInput): number {
  if (!discount) return 0

  assertFiniteNonNegative(discount.value, 'Discount value')
  if (discount.type === 'fixed') {
    assertMinorUnits(discount.value, 'Fixed discount')
    return Math.min(baseMinor, discount.value)
  }

  if (!Number.isInteger(discount.value) || discount.value > MAX_BASIS_POINTS) {
    throw new RangeError('Percentage discount must be integer basis points between 0 and 10,000')
  }
  return Math.min(baseMinor, Math.round(baseMinor * discount.value / MAX_BASIS_POINTS))
}

export function calculateLineItem(input: LineItemInput): CalculatedLineItem {
  const type = input.type ?? 'charge'
  assertFiniteNonNegative(input.quantity, 'Quantity')
  assertMinorUnits(input.unitPriceMinor, 'Unit price')

  if (!input.title.trim()) throw new Error('Line item title is required')
  if (type === 'informational') {
    return {
      ...input,
      type,
      subtotalMinor: 0,
      discountMinor: 0,
      taxMinor: 0,
      totalMinor: 0,
    }
  }

  if (type === 'credit' && input.discount) {
    throw new Error('Credit lines cannot also contain a discount')
  }

  const unsignedSubtotal = Math.round(input.quantity * input.unitPriceMinor)
  assertMinorUnits(unsignedSubtotal, 'Line subtotal')
  const unsignedDiscount = calculateDiscount(unsignedSubtotal, input.discount)
  const taxableMinor = unsignedSubtotal - unsignedDiscount
  const taxRateBps = input.taxRateBps ?? 0

  if (!Number.isInteger(taxRateBps) || taxRateBps < 0 || taxRateBps > MAX_BASIS_POINTS) {
    throw new RangeError('Tax rate must be integer basis points between 0 and 10,000')
  }
  if (type === 'credit' && taxRateBps !== 0) {
    throw new Error('Credit lines must express any tax adjustment as a separate credit line')
  }

  const unsignedTax = Math.round(taxableMinor * taxRateBps / MAX_BASIS_POINTS)
  const sign = type === 'credit' ? -1 : 1

  return {
    ...input,
    type,
    subtotalMinor: sign * unsignedSubtotal,
    discountMinor: unsignedDiscount,
    taxMinor: sign * unsignedTax,
    totalMinor: sign * (taxableMinor + unsignedTax),
  }
}

export function calculateDocumentTotals(input: DocumentCalculationInput): DocumentTotals {
  if (input.lines.length === 0) throw new Error('A document requires at least one line item')

  const lines = input.lines.map(calculateLineItem)
  const subtotalMinor = lines.reduce((sum, line) => sum + line.subtotalMinor, 0)
  const lineDiscountMinor = lines.reduce((sum, line) => sum + line.discountMinor, 0)
  const taxMinor = lines.reduce((sum, line) => sum + line.taxMinor, 0)
  const beforeDocumentDiscount = subtotalMinor - lineDiscountMinor

  if (beforeDocumentDiscount < 0) {
    throw new RangeError('Credits and discounts cannot exceed document charges')
  }

  const documentDiscountMinor = calculateDiscount(beforeDocumentDiscount, input.documentDiscount)
  const totalMinor = beforeDocumentDiscount - documentDiscountMinor + taxMinor

  if (!Number.isSafeInteger(totalMinor) || totalMinor < 0) {
    throw new RangeError('Calculated document total must be a non-negative safe integer')
  }

  return {
    lines,
    subtotalMinor,
    lineDiscountMinor,
    documentDiscountMinor,
    taxMinor,
    totalMinor,
  }
}

export function calculateOutstandingBalance(totalMinor: number, allocatedMinor: number): number {
  assertMinorUnits(totalMinor, 'Document total')
  assertMinorUnits(allocatedMinor, 'Allocated payment')
  if (allocatedMinor > totalMinor) throw new RangeError('Allocated payments cannot exceed the document total')
  return totalMinor - allocatedMinor
}

function marginPercent(profitMinor: number, revenueMinor: number): number | null {
  if (revenueMinor === 0) return null
  return Math.round((profitMinor / revenueMinor) * 10_000) / 100
}

export function calculateProjectFinancials(input: ProjectFinancialInput): ProjectFinancialSummary {
  const values = {
    acceptedQuotationMinor: input.acceptedQuotationMinor ?? 0,
    invoicedMinor: input.invoicedMinor,
    collectedMinor: input.collectedMinor,
    approvedCostMinor: input.approvedCostMinor,
    paidCostMinor: input.paidCostMinor,
  }

  for (const [label, value] of Object.entries(values)) assertMinorUnits(value, label)
  if (values.collectedMinor > values.invoicedMinor) {
    throw new RangeError('Collected revenue cannot exceed invoiced revenue')
  }
  if (values.paidCostMinor > values.approvedCostMinor) {
    throw new RangeError('Paid costs cannot exceed approved costs')
  }

  const invoicedProfitMinor = values.invoicedMinor - values.approvedCostMinor
  const cashProfitMinor = values.collectedMinor - values.paidCostMinor

  return {
    ...values,
    outstandingReceivablesMinor: values.invoicedMinor - values.collectedMinor,
    outstandingPayablesMinor: values.approvedCostMinor - values.paidCostMinor,
    invoicedProfitMinor,
    cashProfitMinor,
    invoicedMarginPercent: marginPercent(invoicedProfitMinor, values.invoicedMinor),
    cashMarginPercent: marginPercent(cashProfitMinor, values.collectedMinor),
  }
}

export function formatMinorUnits(amountMinor: number, currency = 'QAR', locale = 'en-QA'): string {
  if (!Number.isSafeInteger(amountMinor)) throw new RangeError('Amount must be a safe integer in minor units')
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amountMinor / 100)
}
