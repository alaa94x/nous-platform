import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'Nous, Engineered Intelligence'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#0d1410',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 96px',
        position: 'relative',
      }}
    >
      {/* Subtle green glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8, 71, 52,.22) 0%, transparent 70%)',
        }}
      />

      {/* Eyebrow */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#084734',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: 28,
        }}
      >
        [ NOUS · DOHA, QATAR ]
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: '#e8e5e0',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          maxWidth: 800,
        }}
      >
        Engineered Intelligence.
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 18,
          color: '#556B66',
          marginTop: 28,
          letterSpacing: '0.04em',
        }}
      >
        Quiet luxury. Intelligent systems. nous.qa
      </div>
    </div>,
    { ...size },
  )
}
