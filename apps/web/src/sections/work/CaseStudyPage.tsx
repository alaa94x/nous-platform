'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from '@phosphor-icons/react'

interface ResultMetric {
  metric: string
  value: string
  note: string
}

interface CaseStudyProject {
  name: string
  nameAr: string
  tagline: string
  year: string
  tags: string[]
  externalUrl: string | null
  services: string[]
  overview: string
  challenge: string
  solution: string
  results: ResultMetric[]
  tech: string[]
  imageUrl: string | null
}

export default function CaseStudyPage({ project }: { project: CaseStudyProject }) {
  return (
    <article
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        paddingTop: 120,
        paddingBottom: 80,
      }}
    >
      {/* Back nav */}
      <div style={{ padding: '0 56px', marginBottom: 48 }}>
        <Link
          href="/#works"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--accent)',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={12} weight="bold" />
          Back to works
        </Link>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 56px' }}>

        {/* Header */}
        <header style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                color: 'var(--accent)',
                border: '1px solid rgba(96,184,154,.3)',
                padding: '4px 10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
              }}>
                {tag}
              </span>
            ))}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: 'var(--muted)',
              border: '1px solid rgba(255,255,255,.08)',
              padding: '4px 10px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}>
              {project.year}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(40px, 6vw, 80px)',
            fontWeight: 300,
            color: 'var(--text)',
            lineHeight: 1.05,
            letterSpacing: '-.03em',
            marginBottom: 8,
          }}>
            {project.name}
          </h1>
          <p lang="ar" dir="rtl" style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: 'clamp(22px, 3vw, 38px)',
            color: 'var(--muted)',
            lineHeight: 1.4,
            marginBottom: 24,
            textAlign: 'right',
          }}>
            {project.nameAr}
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'rgba(255,255,255,.7)',
            letterSpacing: '.02em',
            maxWidth: 560,
            lineHeight: 1.7,
          }}>
            {project.tagline}
          </p>

          {project.externalUrl && (
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 28,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--bg)',
                background: 'var(--text)',
                padding: '13px 28px',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Visit Site <ArrowUpRight size={12} weight="bold" />
            </a>
          )}
        </header>

        {/* Image placeholder */}
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={`${project.name}, project screenshot`}
            style={{ width: '100%', height: 480, objectFit: 'cover', marginBottom: 64, display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: 400,
            background: 'rgba(255,255,255,.03)',
            border: '1px dashed rgba(255,255,255,.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 64,
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--muted)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}>
              Project image, add via admin
            </p>
          </div>
        )}

        {/* Results strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${project.results.length}, 1fr)`,
          gap: 1,
          marginBottom: 64,
          background: 'rgba(255,255,255,.06)',
        }}>
          {project.results.map(r => (
            <div key={r.metric} style={{
              background: 'var(--bg)',
              padding: '32px 28px',
              borderTop: '2px solid var(--accent)',
            }}>
              <div style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 300,
                color: 'var(--text)',
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {r.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--accent)',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                {r.metric}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--muted)',
                letterSpacing: '.06em',
              }}>
                {r.note}
              </div>
            </div>
          ))}
        </div>

        {/* Body copy */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          marginBottom: 64,
        }}>
          <Section title="Overview" body={project.overview} />
          <Section title="The Challenge" body={project.challenge} />
        </div>

        <div style={{ marginBottom: 64 }}>
          <Section title="Our Solution" body={project.solution} />
        </div>

        {/* Tech stack */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          paddingTop: 40,
          marginBottom: 64,
        }}>
          <h3 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Technologies Used
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {project.tech.map(t => (
              <span key={t} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--text)',
                border: '1px solid rgba(255,255,255,.12)',
                padding: '6px 14px',
                letterSpacing: '.08em',
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          paddingTop: 56,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: '.08em',
            marginBottom: 28,
          }}>
            Have a project in mind?
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--bg)',
              background: 'var(--text)',
              padding: '15px 42px',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Start a Project
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          article > div,
          article > div > header,
          article > div > div {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
          article > div:first-child {
            padding: 0 24px !important;
          }
        }
        @media (max-width: 640px) {
          article > div > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          article > div > div[style*="repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          article > div > div[style*="repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </article>
  )
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--accent)',
        letterSpacing: '.22em',
        textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        {title}
      </h2>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'rgba(255,255,255,.72)',
        lineHeight: 1.85,
        letterSpacing: '.01em',
      }}>
        {body}
      </p>
    </div>
  )
}
