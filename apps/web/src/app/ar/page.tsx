import type { Metadata } from 'next'
import HomeExperience from '@/sections/home/HomeExperience'
import { getHomePageData } from '@/lib/home-data'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'نوس — نُهندِس الذكاء',
  description: 'وكالة تقنية في الدوحة تبني أنظمة الذكاء الاصطناعي، والمنصات الرقمية، وتطبيقات الجوال، والتجارة الإلكترونية للشركات في الخليج.',
  alternates: {
    canonical: '/ar',
    languages: { en: '/', ar: '/ar', 'x-default': '/' },
  },
  openGraph: {
    locale: 'ar_QA',
    alternateLocale: ['en_QA'],
    title: 'نوس — نُهندِس الذكاء',
    description: 'هندسة تقنية جادّة للمؤسسين والعلامات والمؤسسات في الخليج.',
    url: '/ar',
  },
}

export default async function ArabicHomePage() {
  const data = await getHomePageData()
  return <HomeExperience locale="ar" data={data} />
}
