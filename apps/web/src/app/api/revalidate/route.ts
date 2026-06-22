import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Called by the admin app (or Supabase webhook) after content changes.
// Requires REVALIDATE_SECRET to prevent unauthorized cache busting.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  const expected = process.env.REVALIDATE_SECRET

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    revalidatePath('/')
    return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
