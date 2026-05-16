import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { content } = await req.json()

  if (typeof content !== 'string') return NextResponse.json({ error: 'content must be a string' }, { status: 400 })
  if (content.length > 100_000) {
    return NextResponse.json({ error: 'Content too long (max 100,000 chars)' }, { status: 400 })
  }

  // Verify ownership via cascade
  const { data: output } = await supabaseAdmin
    .from('outputs')
    .select('id, cascades!inner(user_id)')
    .eq('id', id)
    .single()

  if (!output || (output as any).cascades?.user_id !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('outputs')
    .update({ content })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
