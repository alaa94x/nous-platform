import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer from '@/sections/footer/Footer'
import ServicePage, { type ServicePageData } from '@/sections/service/ServicePage'
import { getSiteChrome } from '@/lib/site-chrome'

export const metadata: Metadata = {
  title: 'AI Development in Doha, Qatar',
  description:
    'Nous builds custom AI systems for businesses in Qatar and the Gulf, LLMs, RAG pipelines, AI agents, NLP, computer vision, and intelligent automation. Based in Doha.',
  alternates: { canonical: 'https://nous.qa/services/ai' },
  openGraph: {
    title: 'AI Development Company in Doha, Qatar | Nous',
    description: 'Custom AI systems, LLMs, RAG pipelines, and intelligent automation for Qatar businesses.',
    url: 'https://nous.qa/services/ai',
    alternateLocale: ['ar_QA'],
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Development Company in Doha, Qatar | Nous',
    description: 'Custom AI systems, LLMs, RAG pipelines, and intelligent automation for Qatar businesses.',
    images: ['/opengraph-image'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Artificial Intelligence Development',
  provider: { '@type': 'Organization', name: 'Nous', url: 'https://nous.qa' },
  areaServed: ['QA', 'AE', 'SA'],
  description: 'Custom AI development services including LLMs, RAG pipelines, AI agents, NLP, and intelligent automation for businesses in Qatar and the Gulf region.',
  url: 'https://nous.qa/services/ai',
}

const service: ServicePageData = {
  name: 'Artificial Intelligence',
  nameAr: 'الذكاء الاصطناعي',
  slug: 'ai',
  tagline: 'Custom AI systems for businesses in Qatar and the Gulf.',
  description:
    'We design, build, and deploy production-grade AI systems, from large language model integrations and retrieval-augmented generation pipelines to custom NLP models and AI agents. Every system we build is grounded in real business outcomes, not technology for its own sake.',
  whatWeDeliver: [
    'LLM integration (GPT-4, Claude, Gemini, open-source models)',
    'Retrieval-Augmented Generation (RAG) pipelines',
    'Custom AI agents and autonomous workflows',
    'Natural language processing and text classification',
    'Computer vision and image analysis systems',
    'AI-powered search and recommendation engines',
    'Fine-tuned models on proprietary data',
    'AI readiness assessments and architecture consulting',
  ],
  techStack: ['Python', 'LangChain', 'LlamaIndex', 'OpenAI', 'Anthropic Claude', 'TensorFlow', 'PyTorch', 'Pinecone', 'Weaviate', 'FastAPI', 'AWS', 'GCP'],
  useCases: [
    {
      title: 'Intelligent document processing',
      body: 'Extract, classify, and summarize contracts, invoices, and reports at scale. Reduce manual review time and eliminate transcription errors.',
    },
    {
      title: 'Customer-facing AI assistants',
      body: 'Arabic and English chatbots that understand context, access your product data in real time, and hand off to human agents when needed.',
    },
    {
      title: 'Internal knowledge systems',
      body: 'Give your team instant access to company knowledge through a RAG-powered assistant that cites sources and stays current.',
    },
  ],
  faq: [
    {
      q: 'Do you build AI systems in Arabic?',
      a: 'Yes. We build bilingual AI products with native Arabic-language support, including RTL interfaces and Arabic NLP where required.',
    },
    {
      q: 'Can you integrate AI into our existing software?',
      a: 'Yes. Most of our AI engagements are integrations into existing platforms, not greenfield builds. We work with your current stack.',
    },
    {
      q: 'How long does an AI project take?',
      a: 'A focused AI integration typically takes 4-8 weeks from scope to production. More complex systems with custom model training take 3-6 months.',
    },
  ],
}

export const revalidate = 60

export default async function AIServicePage() {
  const chrome = await getSiteChrome()
  return (
    <>
      <Cursor />
      <Noise />
      <Nav siteName={chrome.siteName} />
      <main id="main-content">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ServicePage service={service} />
      </main>
      <Footer siteName={chrome.siteName} companyName={chrome.companyName} contactItems={chrome.contactItems} socialItems={chrome.socialItems} footerCopyright={chrome.footerCopyright} />
    </>
  )
}
