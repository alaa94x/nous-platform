import { notFound } from 'next/navigation'
import DocumentsPage from '@/app/dashboard/documents/page'

export default function DocumentStudioDevelopmentPreview() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return (
    <main style={{ minHeight: '100dvh', padding: 'clamp(16px, 3vw, 42px)', background: 'var(--bg)' }}>
      <DocumentsPage />
    </main>
  )
}
