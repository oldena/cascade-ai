import 'server-only'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 12000)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url?.startsWith('http')) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })

  let rawText: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CascadeBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()
    rawText = stripHtml(html)
  } catch {
    return NextResponse.json({ error: 'Could not fetch URL' }, { status: 422 })
  }

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Extract a structured company profile from this website content. Output a concise text block (max 600 words) covering: company name, sector/industry, products/services, target audience, tone/values, unique differentiators. Skip navigation, legal, cookie banners. Be factual and direct.\n\n---\n${rawText}`,
    }],
  })

  const summary = (msg.content[0] as { text: string }).text
  return NextResponse.json({ context: summary })
}
