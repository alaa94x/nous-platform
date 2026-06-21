import Image from 'next/image'

interface FooterProps {
  siteName?: string
  location?: string
  copyright?: string
  badgeText?: string
}

export default function Footer({
  siteName   = 'nous.',
  location   = 'Qatar · 2025',
  copyright  = '© 2025 Nous. All Rights Reserved.',
  badgeText  = 'AN NOUS MASTERPIECE ✦ AN NOUS MASTERPIECE ✦ ',
}: FooterProps) {
  return (
    <footer
      style={{
        padding: '60px 56px 44px',
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid var(--border)',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      <div
        className="flex items-end justify-between flex-wrap"
        style={{ gap: 20 }}
      >
        {/* Wordmark */}
        <div className="flex items-center" style={{ gap: 12 }}>
          <Image
            src="/nous-logo.svg"
            alt="nous."
            width={32}
            height={32}
            style={{ maxHeight: 32, mixBlendMode: 'multiply', opacity: .7 }}
          />
          <span
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '-.02em',
              color: 'var(--text)',
              opacity: .6,
            }}
          >
            {siteName}
          </span>
        </div>

        {/* Rotating badge */}
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          <svg
            viewBox="0 0 100 100"
            style={{ width: 100, height: 100, animation: 'badge-rot 20s linear infinite', display: 'block' }}
          >
            <defs>
              <path id="bp4" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <text style={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'var(--muted)', letterSpacing: '.14em' }}>
              <textPath href="#bp4">{badgeText}</textPath>
            </text>
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent)',
            }}
          />
        </div>

        {/* Legal */}
        <div
          className="flex flex-col items-end"
          style={{ gap: 6 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: 'var(--accent)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}
          >
            {location}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 7.5,
              color: 'var(--muted)',
              letterSpacing: '.06em',
              opacity: .4,
            }}
          >
            {copyright}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width:768px) {
          footer { padding: 60px 24px 40px !important; }
        }
        @media (max-width:480px) {
          footer { padding: 52px 20px 36px !important; }
        }
      `}</style>
    </footer>
  )
}
