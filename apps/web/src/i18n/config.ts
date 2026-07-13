export const locales = ['en', 'ar'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export function isArabic(locale: Locale) {
  return locale === 'ar'
}

export function localizedPath(pathname: string, locale: Locale) {
  const cleanPath = pathname.startsWith('/ar')
    ? pathname.slice(3) || '/'
    : pathname || '/'

  if (locale === 'ar') return cleanPath === '/' ? '/ar' : `/ar${cleanPath}`
  return cleanPath
}

