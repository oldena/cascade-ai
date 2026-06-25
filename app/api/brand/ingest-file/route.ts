import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const allowed = ['text/plain', 'text/markdown', 'text/csv', 'application/json']
  if (!allowed.includes(file.type) && !file.name.match(/\.(txt|md|csv|json)$/i)) {
    return NextResponse.json({ error: 'Only TXT, MD, CSV, JSON files supported' }, { status: 400 })
  }

  const text = await file.text()
  const context = text.trim().slice(0, 8000)
  return NextResponse.json({ context })
}
