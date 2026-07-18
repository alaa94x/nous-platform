'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './operations.module.css'

type Tab = 'projects' | 'customers' | 'vendors' | 'reminders'
type Customer = { id: string; display_name: string; email: string | null; phone: string | null; payment_terms_days: number }
type Project = { id: string; customer_id: string; name: string; status: string; record_origin: string; target_end_date: string | null; customer?: { display_name: string } | null }
type Vendor = { id: string; display_name: string; kind: string; email: string | null; phone: string | null }
type Reminder = { id: string; title: string; reminder_type: string; due_at: string; status: string }
type Destination = { id: string; name: string; destination_id: string; enabled: boolean }

const EMPTY_CUSTOMER = { display_name: '', email: '', phone: '', payment_terms_days: 0 }
const EMPTY_PROJECT = { customer_id: '', name: '', description: '', status: 'planned', record_origin: 'current', start_date: '', target_end_date: '', currency: 'QAR' }
const EMPTY_VENDOR = { display_name: '', kind: 'freelancer', email: '', phone: '', notes: '' }
const EMPTY_REMINDER = { reminder_type: 'custom', title: '', details: '', due_at: '', lead_hours: 24 }

export default function OperationsPage() {
  const [tab, setTab] = useState<Tab>('projects')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER)
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT)
  const [vendorForm, setVendorForm] = useState(EMPTY_VENDOR)
  const [reminderForm, setReminderForm] = useState(EMPTY_REMINDER)
  const [telegramForm, setTelegramForm] = useState({ name: 'Nous reminders', destination_id: '' })

  const load = useCallback(async () => {
    const [customerResult, projectResult, vendorResult, reminderResult, destinationResult] = await Promise.all([
      supabase.from('customers').select('id,display_name,email,phone,payment_terms_days').order('display_name'),
      supabase.from('client_projects').select('id,customer_id,name,status,record_origin,target_end_date,customer:customers(display_name)').order('created_at', { ascending: false }),
      supabase.from('vendors').select('id,display_name,kind,email,phone').order('display_name'),
      supabase.from('reminders').select('id,title,reminder_type,due_at,status').order('due_at', { ascending: true }),
      supabase.from('notification_destinations').select('id,name,destination_id,enabled').order('created_at'),
    ])
    setCustomers((customerResult.data ?? []) as Customer[])
    setProjects((projectResult.data ?? []) as unknown as Project[])
    setVendors((vendorResult.data ?? []) as Vendor[])
    setReminders((reminderResult.data ?? []) as Reminder[])
    setDestinations((destinationResult.data ?? []) as Destination[])
  }, [])

  useEffect(() => { void load() }, [load])
  useEffect(() => { setShowForm(false); setError('') }, [tab])

  const counts = useMemo(() => ({ projects: projects.length, customers: customers.length, vendors: vendors.length, reminders: reminders.length }), [projects, customers, vendors, reminders])

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      if (tab === 'customers') {
        if (!customerForm.display_name.trim()) throw new Error('Customer name is required.')
        const { error: saveError } = await supabase.from('customers').insert({
          ...customerForm,
          display_name: customerForm.display_name.trim(),
          email: customerForm.email || null,
          phone: customerForm.phone || null,
        })
        if (saveError) throw saveError
        setCustomerForm(EMPTY_CUSTOMER)
      }
      if (tab === 'projects') {
        if (!projectForm.customer_id || !projectForm.name.trim()) throw new Error('Customer and project name are required.')
        const historical = projectForm.record_origin === 'historical_manual'
        const { error: saveError } = await supabase.from('client_projects').insert({
          ...projectForm,
          name: projectForm.name.trim(),
          description: projectForm.description || null,
          start_date: projectForm.start_date || null,
          target_end_date: projectForm.target_end_date || null,
          status: historical ? 'completed' : projectForm.status,
          reminders_enabled: !historical,
          original_created_at: historical && projectForm.start_date ? new Date(`${projectForm.start_date}T12:00:00`).toISOString() : null,
        })
        if (saveError) throw saveError
        setProjectForm(EMPTY_PROJECT)
      }
      if (tab === 'vendors') {
        if (!vendorForm.display_name.trim()) throw new Error('Vendor or freelancer name is required.')
        const { error: saveError } = await supabase.from('vendors').insert({
          ...vendorForm,
          display_name: vendorForm.display_name.trim(),
          email: vendorForm.email || null,
          phone: vendorForm.phone || null,
          notes: vendorForm.notes || null,
        })
        if (saveError) throw saveError
        setVendorForm(EMPTY_VENDOR)
      }
      if (tab === 'reminders') {
        if (!reminderForm.title.trim() || !reminderForm.due_at) throw new Error('Reminder title and due time are required.')
        const dueAt = new Date(reminderForm.due_at)
        const { data: reminder, error: saveError } = await supabase.from('reminders').insert({
          reminder_type: reminderForm.reminder_type,
          title: reminderForm.title.trim(),
          details: reminderForm.details || null,
          due_at: dueAt.toISOString(),
          remind_before: `${reminderForm.lead_hours} hours`,
        }).select('id').single()
        if (saveError) throw saveError
        const { data: destination } = await supabase.from('notification_destinations').select('id').eq('enabled', true).limit(1).maybeSingle()
        if (destination && reminder) {
          const scheduledFor = new Date(dueAt.getTime() - reminderForm.lead_hours * 60 * 60 * 1000)
          await supabase.from('reminder_deliveries').insert({ reminder_id: reminder.id, destination_id: destination.id, scheduled_for: scheduledFor.toISOString() })
        }
        setReminderForm(EMPTY_REMINDER)
      }
      setShowForm(false)
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this record.')
    } finally {
      setSaving(false)
    }
  }

  const noun = tab === 'projects' ? 'project' : tab === 'customers' ? 'customer' : tab === 'vendors' ? 'vendor' : 'reminder'

  const saveTelegram = async () => {
    if (!telegramForm.destination_id.trim()) { setError('Telegram chat ID is required.'); return }
    const { error: saveError } = await supabase.from('notification_destinations').upsert({
      channel: 'telegram', name: telegramForm.name.trim() || 'Nous reminders',
      destination_id: telegramForm.destination_id.trim(), enabled: true,
    }, { onConflict: 'channel,destination_id' })
    if (saveError) { setError(saveError.message); return }
    setTelegramForm({ name: 'Nous reminders', destination_id: '' }); setError(''); await load()
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><h1>Operations</h1><p>Customers, projects, collaborators and due dates in one place.</p></div>
        <button className={styles.primary} onClick={() => setShowForm(value => !value)}>{showForm ? 'Close' : `Add ${noun}`}</button>
      </header>

      <div className={styles.tabs} aria-label="Operations sections">
        {(['projects','customers','vendors','reminders'] as Tab[]).map(item => (
          <button key={item} className={styles.tab} aria-pressed={tab === item} onClick={() => setTab(item)}>{item} · {counts[item]}</button>
        ))}
      </div>

      {tab === 'reminders' && <section className={styles.panel}><div className={styles.panelHead}><strong>Telegram delivery</strong><span>{destinations.some(item => item.enabled) ? 'Connected' : 'Not connected'}</span></div>{destinations.length > 0 ? <div className={styles.list}>{destinations.map(item => <div className={styles.row} key={item.id}><div><strong>{item.name}</strong></div><div><p>Chat ID · {item.destination_id}</p></div><span className={styles.badge}>{item.enabled ? 'Enabled' : 'Disabled'}</span></div>)}</div> : <div className={styles.form}>{error && <p className={styles.message}>{error}</p>}<div className={styles.grid2}><Field label="Connection name"><input value={telegramForm.name} onChange={event => setTelegramForm(current => ({ ...current, name: event.target.value }))} /></Field><Field label="Telegram chat ID"><input value={telegramForm.destination_id} onChange={event => setTelegramForm(current => ({ ...current, destination_id: event.target.value }))} placeholder="Example: 123456789" /></Field></div><div className={styles.actions}><button className={styles.primary} onClick={() => void saveTelegram()}>Connect Telegram</button></div></div>}</section>}

      <section className={styles.panel}>
        <div className={styles.panelHead}><strong>{tab[0]?.toUpperCase()}{tab.slice(1)}</strong><span>{counts[tab]} total</span></div>
        {showForm && <div className={styles.form}>
          {error && <p className={styles.message}>{error}</p>}
          {tab === 'customers' && <CustomerForm value={customerForm} onChange={patch => setCustomerForm(current => ({ ...current, ...patch }))} />}
          {tab === 'projects' && <ProjectForm value={projectForm} customers={customers} onChange={patch => setProjectForm(current => ({ ...current, ...patch }))} />}
          {tab === 'vendors' && <VendorForm value={vendorForm} onChange={patch => setVendorForm(current => ({ ...current, ...patch }))} />}
          {tab === 'reminders' && <ReminderForm value={reminderForm} onChange={patch => setReminderForm(current => ({ ...current, ...patch }))} />}
          <div className={styles.actions}><button className={styles.secondary} onClick={() => setShowForm(false)}>Cancel</button><button className={styles.primary} disabled={saving} onClick={save}>{saving ? 'Saving…' : `Save ${noun}`}</button></div>
        </div>}
        <RecordList tab={tab} customers={customers} projects={projects} vendors={vendors} reminders={reminders} />
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className={styles.field}><span>{label}</span>{children}</label> }
function CustomerForm({ value, onChange }: { value: typeof EMPTY_CUSTOMER; onChange: (patch: Partial<typeof EMPTY_CUSTOMER>) => void }) {
  return <><div className={styles.grid2}><Field label="Customer name"><input value={value.display_name} onChange={e => onChange({ display_name: e.target.value })} /></Field><Field label="Payment terms"><input type="number" min="0" value={value.payment_terms_days} onChange={e => onChange({ payment_terms_days: Number(e.target.value) || 0 })} /></Field></div><div className={styles.grid2}><Field label="Email"><input type="email" value={value.email} onChange={e => onChange({ email: e.target.value })} /></Field><Field label="Phone"><input value={value.phone} onChange={e => onChange({ phone: e.target.value })} /></Field></div></>
}
function ProjectForm({ value, customers, onChange }: { value: typeof EMPTY_PROJECT; customers: Customer[]; onChange: (patch: Partial<typeof EMPTY_PROJECT>) => void }) {
  return <><div className={styles.grid2}><Field label="Customer"><select value={value.customer_id} onChange={e => onChange({ customer_id: e.target.value })}><option value="">Select customer</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.display_name}</option>)}</select></Field><Field label="Project name"><input value={value.name} onChange={e => onChange({ name: e.target.value })} /></Field></div><Field label="Description"><textarea value={value.description} onChange={e => onChange({ description: e.target.value })} /></Field><div className={styles.grid3}><Field label="Record type"><select value={value.record_origin} onChange={e => onChange({ record_origin: e.target.value })}><option value="current">Current project</option><option value="historical_manual">Past project</option></select></Field><Field label="Start date"><input type="date" value={value.start_date} onChange={e => onChange({ start_date: e.target.value })} /></Field><Field label="Target / completed date"><input type="date" value={value.target_end_date} onChange={e => onChange({ target_end_date: e.target.value })} /></Field></div></>
}
function VendorForm({ value, onChange }: { value: typeof EMPTY_VENDOR; onChange: (patch: Partial<typeof EMPTY_VENDOR>) => void }) {
  return <><div className={styles.grid2}><Field label="Name"><input value={value.display_name} onChange={e => onChange({ display_name: e.target.value })} /></Field><Field label="Type"><select value={value.kind} onChange={e => onChange({ kind: e.target.value })}><option value="freelancer">Freelancer</option><option value="company">Company</option><option value="supplier">Supplier</option></select></Field></div><div className={styles.grid2}><Field label="Email"><input type="email" value={value.email} onChange={e => onChange({ email: e.target.value })} /></Field><Field label="Phone"><input value={value.phone} onChange={e => onChange({ phone: e.target.value })} /></Field></div><Field label="Notes"><textarea value={value.notes} onChange={e => onChange({ notes: e.target.value })} /></Field></>
}
function ReminderForm({ value, onChange }: { value: typeof EMPTY_REMINDER; onChange: (patch: Partial<typeof EMPTY_REMINDER>) => void }) {
  return <><div className={styles.grid2}><Field label="Reminder type"><select value={value.reminder_type} onChange={e => onChange({ reminder_type: e.target.value })}><option value="client_payment_due">Client payment due</option><option value="vendor_payment_due">Freelancer payment due</option><option value="meeting">Meeting</option><option value="document_send">Send document</option><option value="document_follow_up">Document follow-up</option><option value="custom">Custom</option></select></Field><Field label="Due date and time"><input type="datetime-local" value={value.due_at} onChange={e => onChange({ due_at: e.target.value })} /></Field></div><Field label="Title"><input value={value.title} onChange={e => onChange({ title: e.target.value })} /></Field><Field label="Details"><textarea value={value.details} onChange={e => onChange({ details: e.target.value })} /></Field><Field label="Notify before"><select value={value.lead_hours} onChange={e => onChange({ lead_hours: Number(e.target.value) })}><option value={1}>1 hour</option><option value={24}>1 day</option><option value={72}>3 days</option><option value={168}>7 days</option></select></Field></>
}

function RecordList({ tab, customers, projects, vendors, reminders }: { tab: Tab; customers: Customer[]; projects: Project[]; vendors: Vendor[]; reminders: Reminder[] }) {
  const rows = tab === 'customers' ? customers.map(item => ({ id:item.id, title:item.display_name, detail:item.email || item.phone || 'No contact details', meta:`${item.payment_terms_days} day terms` })) : tab === 'projects' ? projects.map(item => ({ id:item.id, title:item.name, detail:item.customer?.display_name || 'Customer', meta:item.record_origin === 'historical_manual' ? 'Historical' : item.status })) : tab === 'vendors' ? vendors.map(item => ({ id:item.id, title:item.display_name, detail:item.email || item.phone || 'No contact details', meta:item.kind })) : reminders.map(item => ({ id:item.id, title:item.title, detail:new Date(item.due_at).toLocaleString('en-QA'), meta:item.status }))
  if (rows.length === 0) return <div className={styles.empty}>No {tab} yet.</div>
  return <div className={styles.list}>{rows.map(row => <div className={styles.row} key={row.id}><div><strong>{row.title}</strong></div><div><p>{row.detail}</p></div><span className={styles.badge}>{row.meta}</span></div>)}</div>
}
