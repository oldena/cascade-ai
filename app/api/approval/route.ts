import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createApprovalLink } from '@/lib/approval-tokens'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { cascadeId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { cascadeId } = body
  if (!cascadeId) {
    return NextResponse.json({ error: 'cascadeId is required' }, { status: 400 })
  }

  // Verify cascade ownership
  const { data: cascade } = await supabaseAdmin
    .from('cascades')
    .select('id, user_id')
    .eq('id', cascadeId)
    .single()

  if (!cascade || cascade.user_id !== userId) {
    return NextResponse.json({ error: 'Cascade not found' }, { status: 404 })
  }

  const url = await createApprovalLink(cascadeId)

  // sendApprovalRequestEmail would fire here if cascades had a client_email column.
  // The current schema (001_initial_schema.sql) does not include client_email on cascades,
  // so approval request emails are skipped until that column is added.

  return NextResponse.json({ url })
}
