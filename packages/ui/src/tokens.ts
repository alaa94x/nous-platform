// Nous Design Tokens
// Single source of truth — used in CSS vars, Tailwind theme, and component logic

export const tokens = {
  colors: {
    bg: '#F9F8F6',
    bg2: '#FFFFFF',
    text: '#121C1A',
    accent: '#0A5C47',
    muted: 'rgba(18,28,26,0.38)',
    border: 'rgba(18,28,26,0.08)',
    border2: 'rgba(18,28,26,0.05)',
  },
  fonts: {
    display: 'var(--font-fraunces)',
    mono: 'var(--font-space-mono)',
  },
  easing: {
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const

export type Token = typeof tokens
