import {
  DEFAULT_CONTACT_ITEMS,
  DEFAULT_SOCIAL_ITEMS,
  type ContactItem,
  type SocialItem,
} from '@/sections/footer/Footer'

// Shared Nav + Footer content for every subpage. The homepage builds this
// inline from its own getPageData() fetch; subpages (work, services) used to
// hardcode "nous." and the DEFAULT footer items, which meant admin edits to
// branding or footer links never reached them. This helper centralises the
// site_settings read so a single Supabase call drives the chrome everywhere.

export interface SiteChrome {
  siteName:        string
  companyName:     string
  contactEmail:    string
  contactItems:    ContactItem[]
  socialItems:     SocialItem[]
  footerCopyright: string | undefined
}

const SEED = {
  site_name:     'nous.',
  company_name:  'Nous',
  contact_email: 'nouslab@icould.com',
}

const FALLBACK: SiteChrome = {
  siteName:        SEED.site_name,
  companyName:     SEED.company_name,
  contactEmail:    SEED.contact_email,
  contactItems:    DEFAULT_CONTACT_ITEMS,
  socialItems:     DEFAULT_SOCIAL_ITEMS,
  footerCopyright: undefined,
}

export async function getSiteChrome(): Promise<SiteChrome> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Public content read — the anon key is sufficient under the public_read_*
  // RLS policies. Never the service-role key for plain public reads.
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('your-project')) return FALLBACK

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const query = supabase.from('site_settings').select('key, value')
    // Don't let a hanging connection stall the whole page render.
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out')), 4000),
    )
    const { data } = await Promise.race([query, timeout])

    const settings: Record<string, string> = { ...SEED }
    for (const row of (data as { key: string; value: string }[] | null) ?? []) {
      if (row.value) settings[row.key] = row.value
    }

    let contactItems = DEFAULT_CONTACT_ITEMS
    let socialItems  = DEFAULT_SOCIAL_ITEMS
    try { if (settings['footer_contact_items']) contactItems = JSON.parse(settings['footer_contact_items']) } catch { /* keep defaults */ }
    try { if (settings['footer_social_items'])  socialItems  = JSON.parse(settings['footer_social_items'])  } catch { /* keep defaults */ }

    return {
      siteName:        settings['site_name']     || SEED.site_name,
      companyName:     settings['company_name']  || SEED.company_name,
      contactEmail:    settings['contact_email'] || SEED.contact_email,
      contactItems,
      socialItems,
      footerCopyright: settings['footer_copyright'] || undefined,
    }
  } catch {
    return FALLBACK
  }
}
