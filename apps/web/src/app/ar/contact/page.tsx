import type { Metadata } from 'next'
import ContactRoute from '@/sections/contact/ContactRoute'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'ابدأ مشروعك',
  description: 'أخبرنا عما تريد بناءه. نرد على جميع استفسارات المشاريع خلال 24 ساعة من الدوحة، قطر.',
  alternates: {
    canonical: '/ar/contact',
    languages: { en: '/contact', ar: '/ar/contact', 'x-default': '/contact' },
  },
  openGraph: {
    title: 'ابدأ مشروعك | نوس',
    description: 'املأ موجز المشروع وسنرد عليك خلال 24 ساعة.',
    url: '/ar/contact',
    siteName: 'Nous',
    locale: 'ar_QA',
    alternateLocale: ['en_QA'],
    type: 'website',
    images: ['/opengraph-image'],
  },
}

export default function ArabicContact() {
  return <ContactRoute locale="ar" />
}
