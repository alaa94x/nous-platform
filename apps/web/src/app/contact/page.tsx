import type { Metadata } from 'next'
import ContactRoute from '@/sections/contact/ContactRoute'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Start a Project',
  description: 'Tell us what you are building. We reply to all inquiries within 24 hours. AI, web, mobile, and e-commerce development in Doha, Qatar.',
  alternates: {
    canonical: '/contact',
    languages: { en: '/contact', ar: '/ar/contact', 'x-default': '/contact' },
  },
  openGraph: {
    title: 'Start a Project | Nous',
    description: 'Tell us what you are building. We reply within 24 hours.',
    url: '/contact',
    siteName: 'Nous',
    locale: 'en_QA',
    alternateLocale: ['ar_QA'],
    type: 'website',
    images: ['/opengraph-image'],
  },
}

export default function Contact() {
  return <ContactRoute locale="en" />
}
