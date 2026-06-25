import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  const isText = ['text/plain', 'text/markdown', 'text/csv', 'application/json'].includes(file.type)
    || file.name.match(/\.(txt|md|csv|json)$/i)

  if (!isPdf && !isText) {
    return NextResponse.json({ error: 'Only PDF, TXT, MD, CSV, JSON supported' }, { status: 400 })
  }

  let text: string
  if (isPdf) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const data = await pdfParse(buffer)
    text = data.text
  } else {
    text = await file.text()
  }

  const context = text.replace(/\s{3,}/g, '\n\n').trim().slice(0, 8000)
  return NextResponse.json({ context })
}
