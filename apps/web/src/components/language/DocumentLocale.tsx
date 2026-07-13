'use client'

import { useEffect } from 'react'
import type { Locale } from '@/i18n/config'

export default function DocumentLocale({ locale }: { locale: Locale }) {
  useEffect(() => {
    const root = document.documentElement
    const previousLang = root.lang
    const previousDir = root.dir
    root.lang = locale
    root.dir = locale === 'ar' ? 'rtl' : 'ltr'

    return () => {
      root.lang = previousLang
      root.dir = previousDir
    }
  }, [locale])

  return null
}
