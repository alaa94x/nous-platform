'use client'

import { useReportWebVitals } from 'next/web-vitals'

export default function WebVitals() {
  useReportWebVitals(metric => {
    // Send to our own analytics table
    navigator.sendBeacon(
      '/api/track',
      JSON.stringify({
        event: 'web_vital',
        metadata: {
          name:   metric.name,
          value:  Math.round(metric.value),
          rating: metric.rating,
          id:     metric.id,
        },
      }),
    )
  })
  return null
}
