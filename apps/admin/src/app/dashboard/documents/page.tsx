'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  calculateDocumentTotals, formatMinorUnits,
  type CalculatedLineItem, type DocumentKind, type LineItemType,
} from '@nous/documents'
import { supabase } from '@/lib/supabase'
import styles from './documents.module.css'

const TODAY = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date())

function Field({
  label,
  value,
  onChange,
  type = 'text',
  min,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'number'
  min?: number
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input type={type} min={min} value={value} onChange={event => onChange(event.target.value)} />
    </label>
  )
}

type Customer = { id: string; display_name: string }
type Project = { id: string; customer_id: string; name: string; record_origin: string }
type Issuer = { id: string; display_name: string; legal_name: string }
type PaymentAccount = { id: string; account_name: string; bank_name: string }
type DraftDocument = {
  id: string; kind: DocumentKind; status: string; document_number: string | null
  customer_id: string; client_project_id: string; issuer_profile_id: string
  payment_account_id: string | null; currency: string; issue_date: string | null
  valid_until: string | null; due_date: string | null; current_revision_id: string | null
}
type LineDraft = { id: string; type: LineItemType; title: string; description: string; quantity: number; unitPrice: number }
type SectionDraft = { id: string; heading: string; body: string; isVisible: boolean }

const localId = () => crypto.randomUUID()
const defaultLine = (): LineDraft => ({ id: localId(), type: 'charge', title: 'Project service', description: '', quantity: 1, unitPrice: 0 })
const defaultSections = (): SectionDraft[] => [
  { id: localId(), heading: 'Executive summary', body: '', isVisible: true },
  { id: localId(), heading: 'Terms and milestones', body: '', isVisible: true },
]
const inputDate = (offsetDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

export default function DocumentsPage() {
  const [kind, setKind] = useState<DocumentKind>('quotation')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [issuers, setIssuers] = useState<Issuer[]>([])
  const [drafts, setDrafts] = useState<DraftDocument[]>([])
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [issuerId, setIssuerId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [issueDate, setIssueDate] = useState(inputDate())
  const [validUntil, setValidUntil] = useState(inputDate(14))
  const [dueDate, setDueDate] = useState(inputDate(14))
  const [lines, setLines] = useState<LineDraft[]>([defaultLine()])
  const [sections, setSections] = useState<SectionDraft[]>(defaultSections())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [issuerForm, setIssuerForm] = useState({ legal_name: '', display_name: 'Nous', email: '', phone: '' })

  const load = useCallback(async () => {
    const [customerResult, projectResult, issuerResult, accountResult, draftResult] = await Promise.all([
      supabase.from('customers').select('id,display_name').order('display_name'),
      supabase.from('client_projects').select('id,customer_id,name,record_origin').order('created_at', { ascending: false }),
      supabase.from('issuer_profiles').select('id,display_name,legal_name').eq('active', true).order('is_default', { ascending: false }),
      supabase.from('payment_accounts').select('id,account_name,bank_name').eq('active', true).order('is_default', { ascending: false }),
      supabase.from('documents').select('id,kind,status,document_number,customer_id,client_project_id,issuer_profile_id,payment_account_id,currency,issue_date,valid_until,due_date,current_revision_id').eq('status', 'draft').order('updated_at', { ascending: false }),
    ])
    setCustomers((customerResult.data ?? []) as Customer[])
    setProjects((projectResult.data ?? []) as Project[])
    const nextIssuers = (issuerResult.data ?? []) as Issuer[]
    const nextAccounts = (accountResult.data ?? []) as PaymentAccount[]
    setIssuers(nextIssuers); setDrafts((draftResult.data ?? []) as DraftDocument[])
    setIssuerId(current => current || nextIssuers[0]?.id || '')
    setAccountId(current => current || nextAccounts[0]?.id || '')
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const filteredProjects = useMemo(() => projects.filter(project => project.customer_id === customerId), [projects, customerId])
  const calculation = useMemo(() => {
    try {
      return { totals: calculateDocumentTotals({ lines: lines.map(line => ({
        id: line.id, type: line.type, title: line.title || 'Untitled item', description: line.description,
        quantity: Math.max(0, line.quantity), unitPriceMinor: Math.max(0, Math.round(line.unitPrice * 100)),
      })) }), error: '' }
    } catch (error) {
      return { totals: null, error: error instanceof Error ? error.message : 'Invalid totals' }
    }
  }, [lines])
  const totals = calculation.totals
  const customerName = customers.find(customer => customer.id === customerId)?.display_name || 'Customer'

  const newDraft = () => {
    setDocumentId(null); setCustomerId(''); setProjectId(''); setTitle(''); setSubtitle('')
    setIssueDate(inputDate()); setValidUntil(inputDate(14)); setDueDate(inputDate(14))
    setLines([defaultLine()]); setSections(defaultSections()); setMessage('')
  }

  const openDraft = async (draft: DraftDocument) => {
    if (!draft.current_revision_id) return
    const [{ data: revision }, { data: savedLines }, { data: savedSections }] = await Promise.all([
      supabase.from('document_revisions').select('title,subtitle').eq('id', draft.current_revision_id).single(),
      supabase.from('document_line_items').select('*').eq('revision_id', draft.current_revision_id).order('sort_order'),
      supabase.from('document_revision_sections').select('*').eq('revision_id', draft.current_revision_id).order('sort_order'),
    ])
    setDocumentId(draft.id); setKind(draft.kind); setCustomerId(draft.customer_id); setProjectId(draft.client_project_id)
    setIssuerId(draft.issuer_profile_id); setAccountId(draft.payment_account_id || '')
    setIssueDate(draft.issue_date || inputDate()); setValidUntil(draft.valid_until || inputDate(14)); setDueDate(draft.due_date || inputDate(14))
    setTitle(String(revision?.title ?? '')); setSubtitle(String(revision?.subtitle ?? ''))
    setLines((savedLines ?? []).map(line => ({ id: line.id, type: line.line_type as LineItemType, title: line.title, description: line.description || '', quantity: Number(line.quantity), unitPrice: Number(line.unit_price_minor) / 100 })))
    setSections((savedSections ?? []).map(section => ({ id: section.section_key, heading: section.heading || '', body: String((section.content as { body?: string })?.body ?? ''), isVisible: section.is_visible })))
    setMessage('Draft opened.')
  }

  const saveDraft = async () => {
    if (!totals || !customerId || !projectId || !issuerId || !title.trim()) {
      setMessage(calculation.error || 'Customer, project, issuer, title and at least one valid line item are required.')
      return
    }
    setSaving(true); setMessage('')
    const payloadLines = totals.lines.map(line => ({ ...line, description: line.description || '' }))
    const payloadSections = sections.map((section, index) => ({ key: section.id, blockType: 'rich_text', heading: section.heading, content: { body: section.body }, isVisible: section.isVisible, pageBreakBefore: false, sortOrder: index }))
    const { data, error } = await supabase.rpc('save_document_draft', {
      p_document_id: documentId, p_kind: kind, p_issuer_profile_id: issuerId,
      p_payment_account_id: accountId || null, p_customer_id: customerId,
      p_customer_contact_id: null, p_client_project_id: projectId, p_title: title,
      p_subtitle: subtitle, p_currency: 'QAR', p_issue_date: issueDate || null,
      p_valid_until: kind === 'quotation' ? validUntil || null : null,
      p_due_date: kind === 'invoice' ? dueDate || null : null,
      p_lines: payloadLines, p_sections: payloadSections, p_calculation: totals,
      p_change_note: documentId ? 'Draft updated' : 'Draft created',
    })
    setSaving(false)
    if (error) { setMessage(error.message); return }
    const result = data as { documentId?: string; revisionNumber?: number } | null
    if (result?.documentId) setDocumentId(result.documentId)
    setMessage(`Draft saved · revision ${result?.revisionNumber ?? 1}`)
    await load()
  }

  const createIssuer = async () => {
    if (!issuerForm.legal_name.trim() || !issuerForm.display_name.trim()) { setMessage('Legal and display names are required.'); return }
    const { error } = await supabase.from('issuer_profiles').insert({ ...issuerForm, email: issuerForm.email || null, phone: issuerForm.phone || null, is_default: true })
    if (error) { setMessage(error.message); return }
    await load()
  }

  const updateLine = (id: string, patch: Partial<LineDraft>) => setLines(current => current.map(line => line.id === id ? { ...line, ...patch } : line))
  const moveSection = (index: number, direction: -1 | 1) => setSections(current => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target]!, next[index]!]; return next })

  if (loading) return <div className={styles.loading}>Loading document workspace…</div>
  if (issuers.length === 0) return <div className={styles.workspace}><header className={styles.pageHeader}><div><h1>Set up documents</h1><p>Add the company identity used on quotations and invoices.</p></div></header><section className={styles.setupCard}><Field label="Legal company name" value={issuerForm.legal_name} onChange={value => setIssuerForm(current => ({ ...current, legal_name: value }))} /><Field label="Display name" value={issuerForm.display_name} onChange={value => setIssuerForm(current => ({ ...current, display_name: value }))} /><Field label="Email" value={issuerForm.email} onChange={value => setIssuerForm(current => ({ ...current, email: value }))} /><Field label="Phone" value={issuerForm.phone} onChange={value => setIssuerForm(current => ({ ...current, phone: value }))} />{message && <p className={styles.message}>{message}</p>}<button className={styles.primaryButton} onClick={createIssuer}>Save company</button></section></div>

  return (
    <div className={styles.workspace}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Documents</h1>
          <p>Create quotations and invoices from the fields and sections each project needs.</p>
        </div>
        <button className={styles.secondaryButton} onClick={newDraft}>New document</button>
      </header>

      {drafts.length > 0 && <section className={styles.draftStrip} aria-label="Saved drafts"><span>Saved drafts</span><div>{drafts.map(draft => <button key={draft.id} aria-pressed={documentId === draft.id} onClick={() => void openDraft(draft)}><strong>{draft.kind}</strong><small>{customers.find(customer => customer.id === draft.customer_id)?.display_name || 'Customer'}</small></button>)}</div></section>}

      <div className={styles.studioGrid}>
        <aside className={styles.controls}>
          <div className={styles.controlHeader}>
            <div>
              <strong>Document builder</strong>
              <span>{documentId ? 'Editing saved draft' : 'New draft'}</span>
            </div>
          </div>

          <div className={styles.segmented} aria-label="Document type">
            {(['quotation', 'invoice'] as const).map(option => (
              <button
                key={option}
                type="button"
                aria-pressed={kind === option}
                onClick={() => setKind(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}><span>Customer</span><select value={customerId} onChange={event => { setCustomerId(event.target.value); setProjectId('') }}><option value="">Select customer</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.display_name}</option>)}</select></label>
            <label className={styles.field}><span>Project</span><select value={projectId} onChange={event => setProjectId(event.target.value)} disabled={!customerId}><option value="">Select project</option>{filteredProjects.map(project => <option key={project.id} value={project.id}>{project.name}{project.record_origin === 'historical_manual' ? ' · Past' : ''}</option>)}</select></label>
            <Field label="Document title" value={title} onChange={setTitle} />
            <Field label="Subtitle" value={subtitle} onChange={setSubtitle} />
            <div className={styles.twoFields}>
              <label className={styles.field}><span>Issue date</span><input type="date" value={issueDate} onChange={event => setIssueDate(event.target.value)} /></label>
              <label className={styles.field}><span>{kind === 'quotation' ? 'Valid until' : 'Due date'}</span><input type="date" value={kind === 'quotation' ? validUntil : dueDate} onChange={event => kind === 'quotation' ? setValidUntil(event.target.value) : setDueDate(event.target.value)} /></label>
            </div>
          </div>

          <div className={styles.builderGroup}><div className={styles.builderHead}><strong>Line items</strong><button onClick={() => setLines(current => [...current, defaultLine()])}>Add item</button></div>{lines.map((line, index) => <div className={styles.lineEditor} key={line.id}><div className={styles.lineNumber}>{String(index + 1).padStart(2,'0')}</div><label className={styles.field}><span>Description</span><input value={line.title} onChange={event => updateLine(line.id, { title: event.target.value })} /></label><label className={styles.field}><span>Type</span><select value={line.type} onChange={event => updateLine(line.id, { type: event.target.value as LineItemType })}><option value="charge">Charge</option>{kind === 'invoice' && <option value="credit">Credit / deduction</option>}<option value="informational">Information only</option></select></label><div className={styles.twoFields}><Field label="Quantity" type="number" min={0} value={line.quantity} onChange={value => updateLine(line.id, { quantity: Number(value) || 0 })} /><Field label="Unit price" type="number" min={0} value={line.unitPrice} onChange={value => updateLine(line.id, { unitPrice: Number(value) || 0 })} /></div>{lines.length > 1 && <button className={styles.removeButton} onClick={() => setLines(current => current.filter(item => item.id !== line.id))}>Remove item</button>}</div>)}</div>

          <div className={styles.builderGroup}><div className={styles.builderHead}><strong>Sections</strong><button onClick={() => setSections(current => [...current, { id: localId(), heading: 'New section', body: '', isVisible: true }])}>Add section</button></div>{sections.map((section, index) => <details className={styles.sectionEditor} key={section.id} open={index === 0}><summary><span>{section.heading || 'Untitled section'}</span><small>{section.isVisible ? 'Visible' : 'Hidden'}</small></summary><div><Field label="Heading" value={section.heading} onChange={value => setSections(current => current.map(item => item.id === section.id ? { ...item, heading: value } : item))} /><label className={styles.field}><span>Content</span><textarea value={section.body} onChange={event => setSections(current => current.map(item => item.id === section.id ? { ...item, body: event.target.value } : item))} /></label><label className={styles.visibility}><input type="checkbox" checked={section.isVisible} onChange={event => setSections(current => current.map(item => item.id === section.id ? { ...item, isVisible: event.target.checked } : item))} /> Include in document</label><div className={styles.sectionActions}><button disabled={index === 0} onClick={() => moveSection(index,-1)}>Move up</button><button disabled={index === sections.length - 1} onClick={() => moveSection(index,1)}>Move down</button><button onClick={() => setSections(current => current.filter(item => item.id !== section.id))}>Remove</button></div></div></details>)}</div>

          <div className={styles.totalCard}>
            <span>Total</span>
            <strong>{totals ? formatMinorUnits(totals.totalMinor) : '—'}</strong>
          </div>
          {message && <p className={styles.message}>{message}</p>}
          <button className={styles.primaryButton} disabled={saving} onClick={() => void saveDraft()}>{saving ? 'Saving…' : documentId ? 'Save new revision' : 'Save draft'}</button>
        </aside>

        <section className={styles.previewArea} aria-label={`${kind} preview`}>
          <div className={styles.previewToolbar}>
            <span>Preview</span>
            <span>{kind === 'quotation' ? 'Quotation · 2 pages' : 'Invoice · 1 page'} · QAR</span>
          </div>

          {kind === 'quotation' ? (
            <QuotationPreview client={customerName} title={title || 'Quotation'} subtitle={subtitle} lines={totals?.lines ?? []} total={totals?.totalMinor ?? 0} sections={sections} validity={validUntil} />
          ) : (
            <InvoicePreview client={customerName} title={title || 'Invoice'} subtitle={subtitle} lines={totals?.lines ?? []} total={totals?.totalMinor ?? 0} sections={sections} />
          )}
        </section>
      </div>
    </div>
  )
}

function QuotationPreview({ client, title, subtitle, lines, total, sections, validity }: {
  client: string; title: string; subtitle: string; lines: CalculatedLineItem[]
  total: number; sections: SectionDraft[]; validity: string
}) {
  const visibleSections = sections.filter(section => section.isVisible)
  return <div className={styles.pageStack}>
    <article className={`${styles.paper} ${styles.quotation}`}>
      <header className={styles.quoteMasthead}><div><h2>{title}</h2><p>{subtitle}</p></div><div><span>Client</span><strong>{client}</strong><span>Prepared by</span><strong>NOUS</strong></div></header>
      <div className={styles.metaStrip}><div><span>Quotation no.</span><strong>Draft</strong></div><div><span>Date</span><strong>{TODAY}</strong></div><div><span>Valid until</span><strong>{validity || 'Not set'}</strong></div></div>
      {visibleSections.slice(0,2).map((section,index) => <DocumentSection key={section.id} number={String(index + 1).padStart(2,'0')} title={section.heading || 'Section'}><p className={styles.lead}>{section.body || 'Add section content in the builder.'}</p></DocumentSection>)}
      <PaperFooter page="01 / 02" />
    </article>
    <article className={`${styles.paper} ${styles.quotation}`}>
      <DocumentSection number={String(Math.min(2, visibleSections.length) + 1).padStart(2,'0')} title="Scope and investment">
        <div className={styles.scopeTable}><div className={styles.scopeHead}><span>Production and deliverables</span><span>Cost</span></div>{lines.map(line => <div className={styles.scopeBody} key={line.id || line.title}><div><strong>{line.title}</strong><p>{line.description || `${line.quantity} × ${formatMinorUnits(line.unitPriceMinor)}`}</p></div><strong className={line.type === 'credit' ? styles.credit : ''}>{formatMinorUnits(line.totalMinor)}</strong></div>)}<div className={styles.quoteTotal}><span>Total investment</span><strong>{formatMinorUnits(total)}</strong></div></div>
      </DocumentSection>
      {visibleSections.slice(2).map((section,index) => <DocumentSection key={section.id} number={String(index + Math.min(2,visibleSections.length) + 2).padStart(2,'0')} title={section.heading || 'Section'}><div className={styles.termsBox}><p>{section.body || 'Add section content in the builder.'}</p></div></DocumentSection>)}
      <div className={styles.signatures}><span>For NOUS</span><span>For {client}</span></div><PaperFooter page="02 / 02" />
    </article>
  </div>
}

function InvoicePreview({ client, title, subtitle, lines, total, sections }: {
  client: string; title: string; subtitle: string; lines: CalculatedLineItem[]; total: number; sections: SectionDraft[]
}) {
  const note = sections.find(section => section.isVisible && section.body.trim())
  return <div className={styles.pageStack}><article className={`${styles.paper} ${styles.invoice}`}>
    <header className={styles.invoiceHeader}><div className={styles.invoiceBrand}><strong>نوس</strong><span>Nous</span></div><div><h2>INVOICE</h2><strong>Draft</strong><span>Date: {TODAY}</span></div></header>
    <div className={styles.parties}><div><span>Billed to</span><strong>{client}</strong><p>Doha, Qatar</p></div><div><span>From</span><strong>Nous LLC</strong><p>Doha, Qatar<br />CR No: 05062</p></div></div>
    <div className={styles.invoiceTable}><div className={styles.invoiceTableHead}><span>Description</span><span>Amount (QAR)</span></div>{lines.map(line => <div className={styles.invoiceRow} key={line.id || line.title}><div><strong>{line.title}</strong><p>{line.description || `${line.quantity} × ${formatMinorUnits(line.unitPriceMinor)}`}</p></div><span className={line.type === 'credit' ? styles.credit : ''}>{formatMinorUnits(line.totalMinor).replace('QAR','').trim()}</span></div>)}</div>
    {note && <div className={styles.invoiceNote}><strong>{note.heading}</strong><p>{note.body}</p></div>}
    <div className={styles.invoiceSummary}><div><span>{title}{subtitle ? ` · ${subtitle}` : ''}</span><span>{formatMinorUnits(lines.reduce((sum,line) => sum + line.subtotalMinor,0))}</span></div><div className={styles.netDue}><strong>Net amount due</strong><strong>{formatMinorUnits(total)}</strong></div></div>
    <div className={styles.paymentBox}><strong>Payment instructions</strong><div><span>Bank</span><b>Configured payment account</b></div><div><span>Account</span><b>Nous LLC</b></div><div><span>IBAN</span><b>Stored securely in issuer settings</b></div></div><div className={styles.stamp}>NOUS<br /><span>LLC</span></div>
  </article></div>
}

function DocumentSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className={styles.documentSection}><h3><span>{number}</span>{title}<i /></h3>{children}</section>
}

function PaperFooter({ page }: { page: string }) {
  return <footer className={styles.paperFooter}><strong>NOUS</strong><span>{page}</span></footer>
}
