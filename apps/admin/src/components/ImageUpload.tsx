'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
}

// Compress + convert to WebP client-side before uploading.
// Resizes to max 1600px on longest side, quality 0.82.
async function compressToWebP(file: File, maxPx = 1600, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { naturalWidth: w, naturalHeight: h } = img
      const scale = Math.min(1, maxPx / Math.max(w, h))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/webp',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

export default function ImageUpload({
  value,
  onChange,
  bucket = 'project-images',
  folder = 'projects',
}: ImageUploadProps) {
  const inputRef   = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [status,   setStatus]   = useState<'idle' | 'compressing' | 'uploading' | 'done' | 'error'>('idle')
  const [info,     setInfo]     = useState<string>('')

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('error'); setInfo('Only image files allowed'); return
    }

    setStatus('compressing')
    setInfo(`Compressing ${formatBytes(file.size)}...`)

    let blob: Blob
    try {
      blob = await compressToWebP(file)
    } catch {
      setStatus('error'); setInfo('Compression failed'); return
    }

    const ratio = Math.round((1 - blob.size / file.size) * 100)
    setStatus('uploading')
    setInfo(`Uploading ${formatBytes(blob.size)} (${ratio}% smaller)...`)

    const ext      = 'webp'
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, blob, { contentType: 'image/webp', upsert: false })

    if (error || !data) {
      setStatus('error')
      setInfo(error?.message ?? 'Upload failed')
      return
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    onChange(publicUrl)
    setStatus('done')
    setInfo(`Done — ${formatBytes(blob.size)}`)
  }

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return
    void upload(files[0]!)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setDragging(false)
    onFiles(e.dataTransfer.files)
  }

  const onRemove = async () => {
    if (!value) { onChange(null); return }
    // Extract path after the bucket name in the public URL
    const marker = `/${bucket}/`
    const idx    = value.indexOf(marker)
    if (idx !== -1) {
      const path = value.slice(idx + marker.length)
      await supabase.storage.from(bucket).remove([path])
    }
    onChange(null)
    setStatus('idle')
    setInfo('')
  }

  const borderColor = dragging
    ? 'rgba(96,184,154,.8)'
    : status === 'error'
    ? 'rgba(255,80,80,.5)'
    : status === 'done' || value
    ? 'rgba(96,184,154,.35)'
    : 'var(--border)'

  const statusColor = status === 'error' ? '#ff6b6b' : status === 'done' ? 'var(--accent)' : 'var(--muted)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1px dashed ${borderColor}`,
          borderRadius: 6,
          padding: '20px 16px',
          cursor: 'pointer',
          textAlign: 'center',
          background: dragging ? 'rgba(96,184,154,.06)' : 'var(--surface)',
          transition: 'border-color .2s, background .2s',
          position: 'relative',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onFiles(e.target.files)}
        />

        {value ? (
          /* Preview */
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              style={{
                width: '100%', maxHeight: 140,
                objectFit: 'cover', borderRadius: 4,
                display: 'block',
              }}
              onError={e => { (e.target as HTMLImageElement).style.opacity = '.3' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,.4)',
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0,
              transition: 'opacity .2s',
            }}
              className="img-hover-overlay"
            >
              <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: '#fff', letterSpacing: '.12em' }}>
                CLICK TO REPLACE
              </span>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div style={{ pointerEvents: 'none' }}>
            <div style={{ fontSize: 22, marginBottom: 8, opacity: .4 }}>
              {status === 'compressing' || status === 'uploading' ? '⏳' : '↑'}
            </div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
              {status === 'idle' ? 'Drop image or click to upload' : info}
            </div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, color: 'var(--muted)', opacity: .5, marginTop: 4, letterSpacing: '.06em' }}>
              PNG · JPG · WebP — auto-compressed to WebP
            </div>
          </div>
        )}
      </div>

      {/* Status + remove */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 18 }}>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8, color: statusColor, letterSpacing: '.08em' }}>
          {status !== 'idle' ? info : value ? 'Image set' : ''}
        </span>
        {value && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); void onRemove() }}
            style={{
              fontFamily: 'ui-monospace, monospace', fontSize: 8,
              color: 'var(--danger)', background: 'none', border: 'none',
              cursor: 'pointer', letterSpacing: '.1em', textTransform: 'uppercase',
              padding: '2px 0', opacity: .7,
            }}
          >
            Remove
          </button>
        )}
      </div>

      <style>{`
        .img-hover-overlay:hover { opacity: 1 !important; }
        div:hover > .img-hover-overlay { opacity: 1; }
      `}</style>
    </div>
  )
}
