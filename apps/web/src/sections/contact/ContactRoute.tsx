import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import DocumentLocale from '@/components/language/DocumentLocale'
import ContactPage, { type ContactService } from '@/sections/contact/ContactPage'
import { getHomePageData } from '@/lib/home-data'
import type { Locale } from '@/i18n/config'

interface ServiceSource {
  id: string
  idx?: string | null
  name: string
  name_ar?: string | null
  name_tech?: string | null
  name_tech_ar?: string | null
  category?: string | null
  tech_pills?: string[] | null
  engineering_stack?: string[] | null
}

export default async function ContactRoute({ locale }: { locale: Locale }) {
  const { settings, services: sourceServices } = await getHomePageData()
  const services: ContactService[] = (sourceServices as ServiceSource[]).map(service => ({
    id: service.id,
    idx: service.idx ?? null,
    name: service.name_tech || service.name,
    name_ar: service.name_tech_ar || service.name_ar || null,
    category: service.category ?? null,
    tech_pills: service.tech_pills ?? service.engineering_stack ?? [],
  }))

  return (
    <>
      <DocumentLocale locale={locale} />
      <Cursor />
      <Noise />
      <Nav
        siteName={settings['site_name']}
        variant="contact"
        locale={locale}
        showLanguageSwitch
      />
      <main id="main-content">
        <ContactPage
          services={services}
          contactEmail={settings['contact_email']}
          locale={locale}
        />
      </main>
    </>
  )
}
