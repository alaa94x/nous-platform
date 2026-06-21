'use client'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'

export default function AnalyticsInit() {
  useEffect(() => {
    trackPageView()
  }, [])
  return null
}
