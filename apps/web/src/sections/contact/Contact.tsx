'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { track } from '@/lib/analytics'

interface Service {
  id: string
  name: string
  idx: string | null
  category: string | null
  tech_pills: string[] | null
}

interface ContactProps {
  services: Service[]
  contactEmail?: string
}

// Text-only codes — emoji flags render as letter pairs on Windows, which looks broken
// iso field is the unique key; code is the dial prefix sent with the form
// GCC pinned first, then all countries A-Z
const COUNTRY_CODES = [
  // ── GCC (pinned) ───────────────────────────────────────────
  { iso: 'QA', code: '+974', label: 'QA +974' },
  { iso: 'SA', code: '+966', label: 'SA +966' },
  { iso: 'AE', code: '+971', label: 'AE +971' },
  { iso: 'KW', code: '+965', label: 'KW +965' },
  { iso: 'OM', code: '+968', label: 'OM +968' },
  { iso: 'BH', code: '+973', label: 'BH +973' },
  // ── Rest of world A–Z ──────────────────────────────────────
  { iso: 'AF', code: '+93',   label: 'AF +93'   },
  { iso: 'AL', code: '+355',  label: 'AL +355'  },
  { iso: 'DZ', code: '+213',  label: 'DZ +213'  },
  { iso: 'AS', code: '+1684', label: 'AS +1684' },
  { iso: 'AD', code: '+376',  label: 'AD +376'  },
  { iso: 'AO', code: '+244',  label: 'AO +244'  },
  { iso: 'AI', code: '+1264', label: 'AI +1264' },
  { iso: 'AQ', code: '+672',  label: 'AQ +672'  },
  { iso: 'AG', code: '+1268', label: 'AG +1268' },
  { iso: 'AR', code: '+54',   label: 'AR +54'   },
  { iso: 'AM', code: '+374',  label: 'AM +374'  },
  { iso: 'AW', code: '+297',  label: 'AW +297'  },
  { iso: 'AU', code: '+61',   label: 'AU +61'   },
  { iso: 'AT', code: '+43',   label: 'AT +43'   },
  { iso: 'AZ', code: '+994',  label: 'AZ +994'  },
  { iso: 'BS', code: '+1242', label: 'BS +1242' },
  { iso: 'BD', code: '+880',  label: 'BD +880'  },
  { iso: 'BB', code: '+1246', label: 'BB +1246' },
  { iso: 'BY', code: '+375',  label: 'BY +375'  },
  { iso: 'BE', code: '+32',   label: 'BE +32'   },
  { iso: 'BZ', code: '+501',  label: 'BZ +501'  },
  { iso: 'BJ', code: '+229',  label: 'BJ +229'  },
  { iso: 'BM', code: '+1441', label: 'BM +1441' },
  { iso: 'BT', code: '+975',  label: 'BT +975'  },
  { iso: 'BO', code: '+591',  label: 'BO +591'  },
  { iso: 'BA', code: '+387',  label: 'BA +387'  },
  { iso: 'BW', code: '+267',  label: 'BW +267'  },
  { iso: 'BR', code: '+55',   label: 'BR +55'   },
  { iso: 'IO', code: '+246',  label: 'IO +246'  },
  { iso: 'VG', code: '+1284', label: 'VG +1284' },
  { iso: 'BN', code: '+673',  label: 'BN +673'  },
  { iso: 'BG', code: '+359',  label: 'BG +359'  },
  { iso: 'BF', code: '+226',  label: 'BF +226'  },
  { iso: 'BI', code: '+257',  label: 'BI +257'  },
  { iso: 'KH', code: '+855',  label: 'KH +855'  },
  { iso: 'CM', code: '+237',  label: 'CM +237'  },
  { iso: 'CA', code: '+1',    label: 'CA +1'    },
  { iso: 'CV', code: '+238',  label: 'CV +238'  },
  { iso: 'KY', code: '+1345', label: 'KY +1345' },
  { iso: 'CF', code: '+236',  label: 'CF +236'  },
  { iso: 'TD', code: '+235',  label: 'TD +235'  },
  { iso: 'CL', code: '+56',   label: 'CL +56'   },
  { iso: 'CN', code: '+86',   label: 'CN +86'   },
  { iso: 'CX', code: '+61',   label: 'CX +61'   },
  { iso: 'CC', code: '+61',   label: 'CC +61'   },
  { iso: 'CO', code: '+57',   label: 'CO +57'   },
  { iso: 'KM', code: '+269',  label: 'KM +269'  },
  { iso: 'CK', code: '+682',  label: 'CK +682'  },
  { iso: 'CR', code: '+506',  label: 'CR +506'  },
  { iso: 'HR', code: '+385',  label: 'HR +385'  },
  { iso: 'CU', code: '+53',   label: 'CU +53'   },
  { iso: 'CW', code: '+599',  label: 'CW +599'  },
  { iso: 'CY', code: '+357',  label: 'CY +357'  },
  { iso: 'CZ', code: '+420',  label: 'CZ +420'  },
  { iso: 'CD', code: '+243',  label: 'CD +243'  },
  { iso: 'DK', code: '+45',   label: 'DK +45'   },
  { iso: 'DJ', code: '+253',  label: 'DJ +253'  },
  { iso: 'DM', code: '+1767', label: 'DM +1767' },
  { iso: 'DO', code: '+1809', label: 'DO +1809' },
  { iso: 'EC', code: '+593',  label: 'EC +593'  },
  { iso: 'EG', code: '+20',   label: 'EG +20'   },
  { iso: 'SV', code: '+503',  label: 'SV +503'  },
  { iso: 'GQ', code: '+240',  label: 'GQ +240'  },
  { iso: 'ER', code: '+291',  label: 'ER +291'  },
  { iso: 'EE', code: '+372',  label: 'EE +372'  },
  { iso: 'SZ', code: '+268',  label: 'SZ +268'  },
  { iso: 'ET', code: '+251',  label: 'ET +251'  },
  { iso: 'FK', code: '+500',  label: 'FK +500'  },
  { iso: 'FO', code: '+298',  label: 'FO +298'  },
  { iso: 'FJ', code: '+679',  label: 'FJ +679'  },
  { iso: 'FI', code: '+358',  label: 'FI +358'  },
  { iso: 'FR', code: '+33',   label: 'FR +33'   },
  { iso: 'GF', code: '+594',  label: 'GF +594'  },
  { iso: 'PF', code: '+689',  label: 'PF +689'  },
  { iso: 'GA', code: '+241',  label: 'GA +241'  },
  { iso: 'GM', code: '+220',  label: 'GM +220'  },
  { iso: 'GE', code: '+995',  label: 'GE +995'  },
  { iso: 'DE', code: '+49',   label: 'DE +49'   },
  { iso: 'GH', code: '+233',  label: 'GH +233'  },
  { iso: 'GI', code: '+350',  label: 'GI +350'  },
  { iso: 'GR', code: '+30',   label: 'GR +30'   },
  { iso: 'GL', code: '+299',  label: 'GL +299'  },
  { iso: 'GD', code: '+1473', label: 'GD +1473' },
  { iso: 'GP', code: '+590',  label: 'GP +590'  },
  { iso: 'GU', code: '+1671', label: 'GU +1671' },
  { iso: 'GT', code: '+502',  label: 'GT +502'  },
  { iso: 'GG', code: '+44',   label: 'GG +44'   },
  { iso: 'GN', code: '+224',  label: 'GN +224'  },
  { iso: 'GW', code: '+245',  label: 'GW +245'  },
  { iso: 'GY', code: '+592',  label: 'GY +592'  },
  { iso: 'HT', code: '+509',  label: 'HT +509'  },
  { iso: 'HN', code: '+504',  label: 'HN +504'  },
  { iso: 'HK', code: '+852',  label: 'HK +852'  },
  { iso: 'HU', code: '+36',   label: 'HU +36'   },
  { iso: 'IS', code: '+354',  label: 'IS +354'  },
  { iso: 'IN', code: '+91',   label: 'IN +91'   },
  { iso: 'ID', code: '+62',   label: 'ID +62'   },
  { iso: 'IR', code: '+98',   label: 'IR +98'   },
  { iso: 'IQ', code: '+964',  label: 'IQ +964'  },
  { iso: 'IE', code: '+353',  label: 'IE +353'  },
  { iso: 'IM', code: '+44',   label: 'IM +44'   },
  { iso: 'IL', code: '+972',  label: 'IL +972'  },
  { iso: 'IT', code: '+39',   label: 'IT +39'   },
  { iso: 'CI', code: '+225',  label: 'CI +225'  },
  { iso: 'JM', code: '+1876', label: 'JM +1876' },
  { iso: 'JP', code: '+81',   label: 'JP +81'   },
  { iso: 'JE', code: '+44',   label: 'JE +44'   },
  { iso: 'JO', code: '+962',  label: 'JO +962'  },
  { iso: 'KZ', code: '+7',    label: 'KZ +7'    },
  { iso: 'KE', code: '+254',  label: 'KE +254'  },
  { iso: 'KI', code: '+686',  label: 'KI +686'  },
  { iso: 'XK', code: '+383',  label: 'XK +383'  },
  { iso: 'KP', code: '+850',  label: 'KP +850'  },
  { iso: 'KR', code: '+82',   label: 'KR +82'   },
  { iso: 'KG', code: '+996',  label: 'KG +996'  },
  { iso: 'LA', code: '+856',  label: 'LA +856'  },
  { iso: 'LV', code: '+371',  label: 'LV +371'  },
  { iso: 'LB', code: '+961',  label: 'LB +961'  },
  { iso: 'LS', code: '+266',  label: 'LS +266'  },
  { iso: 'LR', code: '+231',  label: 'LR +231'  },
  { iso: 'LY', code: '+218',  label: 'LY +218'  },
  { iso: 'LI', code: '+423',  label: 'LI +423'  },
  { iso: 'LT', code: '+370',  label: 'LT +370'  },
  { iso: 'LU', code: '+352',  label: 'LU +352'  },
  { iso: 'MO', code: '+853',  label: 'MO +853'  },
  { iso: 'MG', code: '+261',  label: 'MG +261'  },
  { iso: 'MW', code: '+265',  label: 'MW +265'  },
  { iso: 'MY', code: '+60',   label: 'MY +60'   },
  { iso: 'MV', code: '+960',  label: 'MV +960'  },
  { iso: 'ML', code: '+223',  label: 'ML +223'  },
  { iso: 'MT', code: '+356',  label: 'MT +356'  },
  { iso: 'MH', code: '+692',  label: 'MH +692'  },
  { iso: 'MQ', code: '+596',  label: 'MQ +596'  },
  { iso: 'MR', code: '+222',  label: 'MR +222'  },
  { iso: 'MU', code: '+230',  label: 'MU +230'  },
  { iso: 'YT', code: '+262',  label: 'YT +262'  },
  { iso: 'MX', code: '+52',   label: 'MX +52'   },
  { iso: 'FM', code: '+691',  label: 'FM +691'  },
  { iso: 'MD', code: '+373',  label: 'MD +373'  },
  { iso: 'MC', code: '+377',  label: 'MC +377'  },
  { iso: 'MN', code: '+976',  label: 'MN +976'  },
  { iso: 'ME', code: '+382',  label: 'ME +382'  },
  { iso: 'MS', code: '+1664', label: 'MS +1664' },
  { iso: 'MA', code: '+212',  label: 'MA +212'  },
  { iso: 'MZ', code: '+258',  label: 'MZ +258'  },
  { iso: 'MM', code: '+95',   label: 'MM +95'   },
  { iso: 'NA', code: '+264',  label: 'NA +264'  },
  { iso: 'NR', code: '+674',  label: 'NR +674'  },
  { iso: 'NP', code: '+977',  label: 'NP +977'  },
  { iso: 'NL', code: '+31',   label: 'NL +31'   },
  { iso: 'NC', code: '+687',  label: 'NC +687'  },
  { iso: 'NZ', code: '+64',   label: 'NZ +64'   },
  { iso: 'NI', code: '+505',  label: 'NI +505'  },
  { iso: 'NE', code: '+227',  label: 'NE +227'  },
  { iso: 'NG', code: '+234',  label: 'NG +234'  },
  { iso: 'NU', code: '+683',  label: 'NU +683'  },
  { iso: 'NF', code: '+672',  label: 'NF +672'  },
  { iso: 'MK', code: '+389',  label: 'MK +389'  },
  { iso: 'MP', code: '+1670', label: 'MP +1670' },
  { iso: 'NO', code: '+47',   label: 'NO +47'   },
  { iso: 'PK', code: '+92',   label: 'PK +92'   },
  { iso: 'PW', code: '+680',  label: 'PW +680'  },
  { iso: 'PS', code: '+970',  label: 'PS +970'  },
  { iso: 'PA', code: '+507',  label: 'PA +507'  },
  { iso: 'PG', code: '+675',  label: 'PG +675'  },
  { iso: 'PY', code: '+595',  label: 'PY +595'  },
  { iso: 'PE', code: '+51',   label: 'PE +51'   },
  { iso: 'PH', code: '+63',   label: 'PH +63'   },
  { iso: 'PL', code: '+48',   label: 'PL +48'   },
  { iso: 'PT', code: '+351',  label: 'PT +351'  },
  { iso: 'PR', code: '+1787', label: 'PR +1787' },
  { iso: 'RO', code: '+40',   label: 'RO +40'   },
  { iso: 'RU', code: '+7',    label: 'RU +7'    },
  { iso: 'RW', code: '+250',  label: 'RW +250'  },
  { iso: 'SH', code: '+290',  label: 'SH +290'  },
  { iso: 'KN', code: '+1869', label: 'KN +1869' },
  { iso: 'LC', code: '+1758', label: 'LC +1758' },
  { iso: 'PM', code: '+508',  label: 'PM +508'  },
  { iso: 'VC', code: '+1784', label: 'VC +1784' },
  { iso: 'WS', code: '+685',  label: 'WS +685'  },
  { iso: 'SM', code: '+378',  label: 'SM +378'  },
  { iso: 'ST', code: '+239',  label: 'ST +239'  },
  { iso: 'SN', code: '+221',  label: 'SN +221'  },
  { iso: 'RS', code: '+381',  label: 'RS +381'  },
  { iso: 'SC', code: '+248',  label: 'SC +248'  },
  { iso: 'SL', code: '+232',  label: 'SL +232'  },
  { iso: 'SG', code: '+65',   label: 'SG +65'   },
  { iso: 'SX', code: '+1721', label: 'SX +1721' },
  { iso: 'SK', code: '+421',  label: 'SK +421'  },
  { iso: 'SI', code: '+386',  label: 'SI +386'  },
  { iso: 'SB', code: '+677',  label: 'SB +677'  },
  { iso: 'SO', code: '+252',  label: 'SO +252'  },
  { iso: 'ZA', code: '+27',   label: 'ZA +27'   },
  { iso: 'SS', code: '+211',  label: 'SS +211'  },
  { iso: 'ES', code: '+34',   label: 'ES +34'   },
  { iso: 'LK', code: '+94',   label: 'LK +94'   },
  { iso: 'SD', code: '+249',  label: 'SD +249'  },
  { iso: 'SR', code: '+597',  label: 'SR +597'  },
  { iso: 'SE', code: '+46',   label: 'SE +46'   },
  { iso: 'CH', code: '+41',   label: 'CH +41'   },
  { iso: 'SY', code: '+963',  label: 'SY +963'  },
  { iso: 'TW', code: '+886',  label: 'TW +886'  },
  { iso: 'TJ', code: '+992',  label: 'TJ +992'  },
  { iso: 'TZ', code: '+255',  label: 'TZ +255'  },
  { iso: 'TH', code: '+66',   label: 'TH +66'   },
  { iso: 'TL', code: '+670',  label: 'TL +670'  },
  { iso: 'TG', code: '+228',  label: 'TG +228'  },
  { iso: 'TK', code: '+690',  label: 'TK +690'  },
  { iso: 'TO', code: '+676',  label: 'TO +676'  },
  { iso: 'TT', code: '+1868', label: 'TT +1868' },
  { iso: 'TN', code: '+216',  label: 'TN +216'  },
  { iso: 'TR', code: '+90',   label: 'TR +90'   },
  { iso: 'TM', code: '+993',  label: 'TM +993'  },
  { iso: 'TC', code: '+1649', label: 'TC +1649' },
  { iso: 'TV', code: '+688',  label: 'TV +688'  },
  { iso: 'VI', code: '+1340', label: 'VI +1340' },
  { iso: 'UG', code: '+256',  label: 'UG +256'  },
  { iso: 'UA', code: '+380',  label: 'UA +380'  },
  { iso: 'GB', code: '+44',   label: 'GB +44'   },
  { iso: 'US', code: '+1',    label: 'US +1'    },
  { iso: 'UY', code: '+598',  label: 'UY +598'  },
  { iso: 'UZ', code: '+998',  label: 'UZ +998'  },
  { iso: 'VU', code: '+678',  label: 'VU +678'  },
  { iso: 'VA', code: '+379',  label: 'VA +379'  },
  { iso: 'VE', code: '+58',   label: 'VE +58'   },
  { iso: 'VN', code: '+84',   label: 'VN +84'   },
  { iso: 'WF', code: '+681',  label: 'WF +681'  },
  { iso: 'YE', code: '+967',  label: 'YE +967'  },
  { iso: 'ZM', code: '+260',  label: 'ZM +260'  },
  { iso: 'ZW', code: '+263',  label: 'ZW +263'  },
]

export default function Contact({ services, contactEmail = 'hello@nous.qa' }: ContactProps) {
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [phone,       setPhone]       = useState('')
  const [countryCode, setCountryCode] = useState('+974')
  const [message,     setMessage]     = useState('')
  const [selectedSvc, setSelectedSvc] = useState<Set<string>>(new Set())
  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')

  const sectionRef    = useRef<HTMLElement>(null)
  const formHeaderRef = useRef<HTMLDivElement>(null)
  const nameInputRef  = useRef<HTMLInputElement>(null)
  const successRef    = useRef<HTMLDivElement>(null)

  const hasName    = name.trim().length > 0
  const hasEmail   = email.trim().length > 3
  const hasSvc     = selectedSvc.size > 0
  const hasMsg     = message.trim().length > 0

  const tracked = useRef({ start: false, s1: false, s2: false, s3: false, s4: false })
  useEffect(() => {
    const t = tracked.current
    if (!t.start && name.length > 0) { t.start = true; track('contact_form_started') }
    if (!t.s1 && hasName)  { t.s1 = true; track('contact_form_step', { step: 1 }) }
    if (!t.s2 && hasEmail) { t.s2 = true; track('contact_form_step', { step: 2 }) }
    if (!t.s3 && hasSvc)   { t.s3 = true; track('contact_form_step', { step: 3 }) }
    if (!t.s4 && hasMsg)   { t.s4 = true; track('contact_form_step', { step: 4 }) }
  }, [name, hasName, hasEmail, hasSvc, hasMsg])

  const filled  = [hasName, hasEmail, hasSvc, hasMsg].filter(Boolean).length
  const pct     = Math.round((filled / 4) * 100)
  const isReady = filled === 4

  const briefName        = hasName ? `Hello,\n${name.split(' ')[0]}.` : 'Hello,\nWorld.'
  const briefNameCompact = hasName ? `Hello, ${name.split(' ')[0]!}.` : 'Hello, World.'
  const briefStatus = hasName
    ? (hasEmail ? (hasSvc ? (hasMsg ? 'Brief complete' : 'Almost there') : 'Choose a service') : 'Add your email')
    : 'Start with your name'

  // Scroll nav CONTACT link to the form section header (so user sees context above the field)
  useEffect(() => {
    const handleNavContact = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement
      if (target.getAttribute('href') === '#contact') {
        e.preventDefault()
        const header = formHeaderRef.current
        if (!header) return
        const navH = 72
        const top  = header.getBoundingClientRect().top + window.scrollY - navH - 16
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href="#contact"]')
    links.forEach(l => l.addEventListener('click', handleNavContact))
    return () => links.forEach(l => l.removeEventListener('click', handleNavContact))
  }, [])

  // On success: clear form, auto-dismiss toast after 5s
  useEffect(() => {
    if (!submitted) return
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
    setSelectedSvc(new Set())
    const t = setTimeout(() => setSubmitted(false), 5000)
    return () => clearTimeout(t)
  }, [submitted])

  const toggleService = (val: string) => {
    setSelectedSvc(prev => {
      const next = new Set(prev)
      if (val === 'Not Sure Yet') {
        if (next.has(val)) { next.delete(val) }
        else { next.clear(); next.add(val) }
      } else {
        next.delete('Not Sure Yet')
        if (next.has(val)) { next.delete(val) } else { next.add(val) }
      }
      return next
    })
  }

  const handleSubmit = async () => {
    if (!isReady || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone ? `${countryCode} ${phone}` : undefined,
          services: Array.from(selectedSvc),
          message,
        }),
      })
      if (!res.ok) throw new Error('Submit failed')
      track('contact_form_submitted', { services: Array.from(selectedSvc) })
      setSubmitted(true)
    } catch {
      setError(`Something went wrong. Email us directly at ${contactEmail}.`)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    fontFamily: 'var(--font-fraunces)',
    fontSize: 'clamp(22px, 3vw, 36px)',
    fontWeight: 300,
    color: 'var(--text)',
    background: 'none',
    border: 'none',
    outline: 'none',
    width: '100%',
    letterSpacing: '-.02em',
    padding: 0,
  } as const

  const stepActive = (stepIdx: number) => {
    const checks = [hasName, hasEmail, hasSvc, hasMsg]
    return !checks[stepIdx] && (stepIdx === 0 || !!checks[stepIdx - 1])
  }
  const stepDone = (stepIdx: number) => {
    const checks = [hasName, hasEmail, hasSvc, hasMsg]
    return !!checks[stepIdx]
  }
  // Inactive steps: still visible but clearly dimmed. Active/done: full opacity.
  const stepStyle = (stepIdx: number) => ({
    opacity: stepDone(stepIdx) ? 1 : stepActive(stepIdx) ? 1 : 0.38,
    transition: 'opacity .5s cubic-bezier(.16,1,.3,1)',
    pointerEvents: (stepActive(stepIdx) || stepDone(stepIdx) || stepIdx === 0) ? 'auto' as const : 'auto' as const,
  })

  return (
    <section
      id="contact"
      aria-label="Contact — Start a project"
      ref={sectionRef}
      className="relative z-10"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* ── Success overlay — full screen, premium, auto-dismiss ── */}
      {submitted && (
        <div
          ref={successRef}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(10,14,12,.82)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'overlay-in .45s cubic-bezier(.16,1,.3,1) forwards',
          }}
          onClick={() => setSubmitted(false)}
        >
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid rgba(10,92,71,.22)',
              padding: '52px 56px',
              maxWidth: 480,
              width: 'calc(100vw - 48px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
              position: 'relative',
              overflow: 'hidden',
              animation: 'card-up .55s cubic-bezier(.16,1,.3,1) .05s both',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Accent timer bar at top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(10,92,71,.12)' }}>
              <div style={{ height: '100%', background: 'var(--accent)', animation: 'toast-timer 5s linear forwards', transformOrigin: 'left' }} />
            </div>

            {/* Check mark */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1.5px solid rgba(10,92,71,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, position: 'relative' }}>
              <svg style={{ position: 'absolute', inset: 0, animation: 'spin-cw 18s linear infinite' }} viewBox="0 0 56 56" width="56" height="56">
                <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(10,92,71,.15)" strokeWidth="1" strokeDasharray="3 5" />
              </svg>
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                <path d="M1 7.5l5.5 5.5L19 1" stroke="#0A5C47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Headline */}
            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 700, fontStyle: 'italic', color: 'var(--text)', letterSpacing: '-.03em', lineHeight: 1, marginBottom: 10, textAlign: 'center' }}>
              Brief received.
            </h3>

            {/* Sub */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', lineHeight: 2, textAlign: 'center', marginBottom: 32 }}>
              We&apos;ll reply to <span style={{ color: 'var(--accent)' }}>{email}</span><br />within 24 hours.
            </p>

            {/* Divider */}
            <div style={{ width: 40, height: 1, background: 'rgba(10,92,71,.22)', marginBottom: 28 }} />

            {/* Dismiss */}
            <button
              onClick={() => setSubmitted(false)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', opacity: .55, padding: '4px 0' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Mobile-only sticky greeting + progress bar */}
      <div
        id="mob-brief-bar"
        style={{
          display: 'none',
          position: 'sticky',
          top: 64,
          zIndex: 20,
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 20px 0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(20px, 5.5vw, 28px)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.03em' }}>
            {briefNameCompact}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.1em' }}>{pct}%</span>
        </div>
        <div style={{ height: 2, background: 'var(--border)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width .6s cubic-bezier(.16,1,.3,1)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'var(--accent)', letterSpacing: '.14em', textTransform: 'uppercase', display: 'block', marginTop: 8, marginBottom: 4, fontWeight: 600 }}>
          {briefStatus}
        </span>
      </div>

      {/* 2-col layout */}
      <div
        id="contact-cols"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}
      >

        {/* LEFT: live brief preview */}
        <div
          id="brief-preview"
          style={{
            padding: '72px 56px',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--bg)',
          }}
        >
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--accent)', letterSpacing: '.24em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              [ 004 — CONTACT ]
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: hasName ? 'var(--accent)' : 'var(--border)', transition: 'background .4s', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: hasName ? 'var(--accent)' : 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase', transition: 'color .4s', fontWeight: hasName ? 600 : 400 }}>
                {briefStatus}
              </span>
            </div>
          </div>

          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(48px, 7vw, 100px)', fontWeight: 700, color: 'var(--text)', lineHeight: .95, letterSpacing: '-.04em', transition: 'opacity .4s', opacity: hasName ? 1 : .12, wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
              {briefName}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {hasSvc && (
              <div style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity .5s, transform .5s' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Service</span>
                <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: 18, fontWeight: 300, fontStyle: 'italic', color: 'var(--accent)' }}>
                  {Array.from(selectedSvc).join(', ')}
                </span>
              </div>
            )}
            {hasMsg && (
              <div style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity .5s .1s, transform .5s .1s' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Vision</span>
                <p style={{ fontFamily: 'var(--font-fraunces)', fontSize: 13, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.85, maxHeight: 80, overflow: 'hidden' }}>
                  {message}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Brief completion</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.1em' }}>{pct}%</span>
            </div>
            <div style={{ height: 1, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width .6s cubic-bezier(.16,1,.3,1)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, opacity: .3 }}>
              <div style={{ width: 18, height: 1, background: 'var(--muted)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.12em' }}>25°17&apos;N 51°31&apos;E · nous.qa</span>
            </div>
          </div>
        </div>

        {/* RIGHT: progressive form */}
        <div
          id="form-side"
          ref={formHeaderRef}
          style={{ padding: '72px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}
        >
          <div id="form-steps" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Step 1: Name */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(0) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>01</span>
                <label htmlFor="contact-name" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  What&apos;s your name?
                </label>
                {!hasName && (
                  <span className="start-nudge" aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.14em', opacity: .7 }}>
                    ← Start here
                  </span>
                )}
              </div>
              <input
                id="contact-name"
                ref={nameInputRef}
                type="text"
                autoComplete="name"
                placeholder="Type your name…"
                aria-required="true"
                aria-label="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <div style={{ position: 'absolute', bottom: -1, left: 0, width: hasName ? '100%' : 0, height: 1.5, background: 'var(--accent)', transition: 'width .5s cubic-bezier(.16,1,.3,1)' }} />
            </div>

            {/* Step 2: Email */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(1) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>02</span>
                <label htmlFor="contact-email" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Your email address?</label>
              </div>
              <input
                id="contact-email"
                type="email"
                autoComplete="email"
                placeholder="hello@company.qa"
                aria-required="true"
                aria-label="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <div style={{ position: 'absolute', bottom: -1, left: 0, width: hasEmail ? '100%' : 0, height: 1.5, background: 'var(--accent)', transition: 'width .5s cubic-bezier(.16,1,.3,1)' }} />
            </div>

            {/* Step 2b: Phone */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(1) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>02b</span>
                <label htmlFor="contact-phone" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  Phone number? <span style={{ opacity: .45 }}>(Optional)</span>
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0, marginRight: 16 }}>
                  <select
                    aria-label="Country code"
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(14px,1.8vw,20px)', fontWeight: 400, color: 'var(--accent)', background: 'none', border: 'none', outline: 'none', appearance: 'none', paddingRight: 18, cursor: 'pointer', letterSpacing: '.04em' }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.iso} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <svg style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="#0A5C47" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ width: 1, height: 32, background: 'var(--border)', marginRight: 16, flexShrink: 0 }} />
                <input
                  id="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="5X XXX XXXX"
                  aria-label="Phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ ...inputStyle, flex: 1, letterSpacing: '-.01em' }}
                />
              </div>
            </div>

            {/* Step 3: Service selector */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(2) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>03</span>
                  <span role="group" aria-label="What services do you need? Select all that apply" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>What do you need?</span>
                </div>
                <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.12em', opacity: .65 }}>Select all that apply</span>
              </div>
              <div id="svc-pills-grid" role="group" aria-label="Service options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {services.map(s => {
                  const isSelected = selectedSvc.has(s.name)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={isSelected}
                      className={`svc-card${isSelected ? ' selected' : ''}`}
                      onClick={() => toggleService(s.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: isSelected ? 'rgba(10,92,71,.07)' : 'none',
                        textAlign: 'left',
                        transition: 'border-color .2s, background .2s',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: isSelected ? 'var(--accent)' : 'var(--muted)', flexShrink: 0, transition: 'color .2s' }}>{s.idx}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isSelected ? 'var(--accent)' : 'var(--text)', letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .2s' }}>{s.name}</div>
                        <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 11, color: isSelected ? 'var(--accent)' : 'var(--muted)', fontStyle: 'italic', marginTop: 2, opacity: isSelected ? .8 : .6, transition: 'color .2s, opacity .2s' }}>{s.category}</div>
                      </div>
                      {/* Checkmark circle */}
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${isSelected ? 'var(--accent)' : 'rgba(18,28,26,.2)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? 'var(--accent)' : 'none', transition: 'border-color .2s, background .2s' }}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" style={{ opacity: isSelected ? 1 : 0, transition: 'opacity .2s' }}>
                          <path d="M1 3l2 2 4-4" stroke="#F9F8F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
                {/* Not sure */}
                <button
                  type="button"
                  aria-pressed={selectedSvc.has('Not Sure Yet')}
                  className={`svc-card svc-card-wide${selectedSvc.has('Not Sure Yet') ? ' selected' : ''}`}
                  onClick={() => toggleService('Not Sure Yet')}
                  style={{
                    gridColumn: '1/-1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    border: selectedSvc.has('Not Sure Yet') ? '1px solid var(--accent)' : '1px dashed rgba(18,28,26,.18)',
                    background: selectedSvc.has('Not Sure Yet') ? 'rgba(10,92,71,.07)' : 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color .2s, background .2s',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: selectedSvc.has('Not Sure Yet') ? 'var(--accent)' : 'var(--muted)', flexShrink: 0, transition: 'color .2s' }}>?</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: selectedSvc.has('Not Sure Yet') ? 'var(--accent)' : 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', transition: 'color .2s' }}>Not sure yet — let&apos;s figure it out</div>
                    <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 10, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2, opacity: .7 }}>Tell us your goals in the vision field below</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${selectedSvc.has('Not Sure Yet') ? 'var(--accent)' : 'rgba(18,28,26,.2)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedSvc.has('Not Sure Yet') ? 'var(--accent)' : 'none', transition: 'border-color .2s, background .2s' }}>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" style={{ opacity: selectedSvc.has('Not Sure Yet') ? 1 : 0, transition: 'opacity .2s' }}>
                      <path d="M1 3l2 2 4-4" stroke="#F9F8F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              </div>
              {hasSvc && (
                <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--accent)', letterSpacing: '.14em' }}>
                  {selectedSvc.size} service{selectedSvc.size !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* Step 4: Vision */}
            <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', position: 'relative', ...stepStyle(3) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.12em' }}>04</span>
                <label htmlFor="contact-message" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Describe your vision</label>
              </div>
              <textarea
                id="contact-message"
                rows={3}
                placeholder="Tell us what you're building…"
                aria-label="Describe your vision or project"
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.7, fontSize: 'clamp(18px,2.2vw,26px)', letterSpacing: '-.01em' }}
              />
              <div style={{ position: 'absolute', bottom: -1, left: 0, width: hasMsg ? '100%' : 0, height: 1.5, background: 'var(--accent)', transition: 'width .5s cubic-bezier(.16,1,.3,1)' }} />
            </div>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <button
              type="button"
              id="submit-btn"
              data-magnetic-btn="true"
              aria-disabled={!isReady || submitting}
              aria-busy={submitting}
              aria-label={submitting ? 'Sending your brief, please wait' : 'Submit your brief'}
              className={`init-btn${isReady ? ' ready' : ''}`}
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                fontWeight: 700,
                color: 'var(--bg)',
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                background: isReady ? 'var(--text)' : 'rgba(18,28,26,.25)',
                padding: '16px 48px',
                border: 'none',
                opacity: 1,
                transition: 'background .4s, transform .2s',
                cursor: isReady ? 'pointer' : 'not-allowed',
              }}
            >
              <span className="btn-txt">{submitting ? 'Sending…' : 'Transmit Brief →'}</span>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.12em', opacity: .55 }}>{contactEmail}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--muted)', letterSpacing: '.12em', opacity: .35 }}>Response within 24h</span>
            </div>
          </div>

          {/* aria-live: error announced immediately to screen readers */}
          <p
            role="alert"
            aria-live="assertive"
            style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 8, color: '#c0392b', letterSpacing: '.08em', minHeight: '1em' }}
          >
            {error}
          </p>
        </div>

      </div>

      <style>{`
        @media (max-width:900px) {
          #mob-brief-bar { display: block !important; }
          #contact-cols { grid-template-columns: 1fr !important; min-height: auto !important; }
          #brief-preview { display: none !important; }
          #form-side { padding: 28px 20px 72px !important; min-height: auto !important; justify-content: flex-start !important; }
        }
        @media (max-width:600px) {
          #svc-pills-grid { grid-template-columns: 1fr 1fr !important; }
        }

        /* "Start here" nudge pulse */
        .start-nudge {
          animation: nudge-pulse 2s ease-in-out infinite;
        }
        @keyframes nudge-pulse {
          0%, 100% { opacity: .4; transform: translateX(0); }
          50%       { opacity: .9; transform: translateX(3px); }
        }

        /* Success overlay animations */
        @keyframes overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes card-up {
          from { opacity: 0; transform: translateY(24px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-timer {
          from { width: 100%; }
          to   { width: 0%; }
        }

        /* Service card hover (desktop) */
        .svc-card:hover:not(.selected) {
          border-color: rgba(10,92,71,.35) !important;
          background: rgba(10,92,71,.03) !important;
        }
      `}</style>
    </section>
  )
}
