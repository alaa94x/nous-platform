import type { Metadata } from 'next'
import Nav from '@/components/nav/Nav'
import Cursor from '@/components/cursor/Cursor'
import Noise from '@/components/noise/Noise'
import Footer from '@/sections/footer/Footer'
import ServicePage, { type ServicePageData } from '@/sections/service/ServicePage'
import { getSiteChrome } from '@/lib/site-chrome'

export const metadata: Metadata = {
  title: 'Cloud Infrastructure and DevOps in Doha, Qatar',
  description:
    'Nous designs and manages cloud infrastructure for businesses in Qatar, AWS, GCP, Docker, Kubernetes, Terraform, and CI/CD pipelines. DevOps consulting based in Doha.',
  alternates: { canonical: 'https://nous.qa/services/cloud' },
  openGraph: {
    title: 'Cloud Infrastructure and DevOps in Doha, Qatar | Nous',
    description: 'AWS, GCP, Kubernetes, and CI/CD for Qatar businesses.',
    url: 'https://nous.qa/services/cloud',
    alternateLocale: ['ar_QA'],
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cloud Infrastructure and DevOps in Doha, Qatar | Nous',
    description: 'AWS, GCP, Kubernetes, and CI/CD for Qatar businesses.',
    images: ['/opengraph-image'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Cloud Infrastructure and DevOps',
  provider: { '@type': 'Organization', name: 'Nous', url: 'https://nous.qa' },
  areaServed: ['QA', 'AE', 'SA'],
  description: 'Cloud infrastructure design, DevOps, and managed services for businesses in Qatar and the Gulf, using AWS, GCP, Docker, Kubernetes, and Terraform.',
  url: 'https://nous.qa/services/cloud',
}

const service: ServicePageData = {
  name: 'Cloud Infrastructure',
  nameAr: 'البنية التحتية السحابية',
  slug: 'cloud',
  tagline: 'Scalable, secure cloud architecture for Gulf businesses.',
  description:
    'We design, build, and manage cloud infrastructure that scales with your business. From initial AWS or GCP setup and containerization with Docker and Kubernetes, to CI/CD pipelines and infrastructure-as-code with Terraform, we handle the engineering so your team can focus on the product.',
  whatWeDeliver: [
    'AWS and GCP architecture design and setup',
    'Docker containerization and Kubernetes orchestration',
    'Infrastructure-as-Code with Terraform and Pulumi',
    'CI/CD pipeline setup (GitHub Actions, GitLab CI, CircleCI)',
    'Cloud cost optimization and right-sizing',
    'Database management (RDS, Cloud SQL, managed Postgres)',
    'Security hardening, IAM policies, and compliance review',
    'Monitoring, alerting, and on-call runbook setup',
  ],
  techStack: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Pulumi', 'GitHub Actions', 'GitLab CI', 'Prometheus', 'Grafana', 'Datadog', 'Cloudflare'],
  useCases: [
    {
      title: 'Startup infrastructure from scratch',
      body: 'Set up a production-grade AWS environment with staging, logging, alerting, and CI/CD from day one, before you have a DevOps team.',
    },
    {
      title: 'Cloud migration',
      body: 'Move from shared hosting or a legacy provider to a modern cloud environment with zero downtime and a clear rollback plan.',
    },
    {
      title: 'Cost and performance audit',
      body: 'Review your existing cloud bill, identify waste, right-size instances, and put auto-scaling in place to handle traffic spikes.',
    },
  ],
  faq: [
    {
      q: 'Do you manage infrastructure on an ongoing basis?',
      a: 'Yes. We offer managed infrastructure retainers with defined SLAs, on-call support, and monthly review calls.',
    },
    {
      q: 'Do you work with on-premise or hybrid setups?',
      a: 'Yes. We work with hybrid cloud and on-premise setups, including Contabo VPS and bare-metal environments popular in the Qatar market.',
    },
    {
      q: 'Can you help with data residency requirements in Qatar?',
      a: 'Yes. We design architectures that keep data within Qatar or the GCC region to meet local compliance requirements.',
    },
  ],
}

export const revalidate = 60

export default async function CloudServicePage() {
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
