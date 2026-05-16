import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendApprovalCompleteEmail } from '@/lib/email'

export async function POST(req: Request) {
  let body: { token: string; action: 'approve' | 'request_changes'; comment?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { token, action, comment } = body
  if (!token || !action) {
    return NextResponse.json({ error: 'token and action are required' }, { status: 400 })
  }
  if (action !== 'approve' && action !== 'request_changes') {
    return NextResponse.json({ error: 'action must be approve or request_changes' }, { status: 400 })
  }

  // Fetch approval link
  const { data: link } = await supabaseAdmin
    .from('approval_links')
    .select('id, cascade_id, expires_at, consumed_at')
    .eq('token', token)
    .single()

  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  // Validate: not expired
  if (new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Link has expired' }, { status: 410 })
  }

  // Validate: not consumed
  if (link.consumed_at !== null) {
    return NextResponse.json({ error: 'Link has already been used' }, { status: 410 })
  }

  // Mark consumed BEFORE updating cascade (prevent double-consume race)
  const { error: consumeError } = await supabaseAdmin
    .from('approval_links')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', link.id)
    .is('consumed_at', null) // atomic guard

  if (consumeError) {
    return NextResponse.json({ error: 'Failed to consume link' }, { status: 500 })
  }

  // Determine new cascade status
  const newStatus = action === 'approve' ? 'approved' : 'needs_revision'

  // Build update payload
  const updatePayload: Record<string, string> = { status: newStatus }
  if (comment) {
    updatePayload['client_notes'] = comment
  }

  const { error: updateError } = await supabaseAdmin
    .from('cascades')
    .update(updatePayload)
    .eq('id', link.cascade_id)

  if (updateError) {
    // Log but don't fail — consumed_at is already set
    console.error('Failed to update cascade status:', updateError.message)
  }

  // Fire-and-forget: notify cascade owner that client has acted
  try {
    const { data: cascade } = await supabaseAdmin
      .from('cascades')
      .select('user_id')
      .eq('id', link.cascade_id)
      .single()
    if (cascade?.user_id) {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(cascade.user_id)
      const ownerEmail = clerkUser.emailAddresses[0]?.emailAddress
      if (ownerEmail) {
        const cascadeLabel = `Cascade ${link.cascade_id.slice(0, 8)}`
        sendApprovalCompleteEmail(ownerEmail, {
          cascadeName: cascadeLabel,
          action: newStatus === 'approved' ? 'approved' : 'needs_revision',
          comment,
        }).catch(err => console.error('[approve] email send failed:', err))
      }
    }
  } catch (err) {
    console.error('[approve] failed to send approval complete email:', err)
  }

  return NextResponse.json({ success: true, action })
}
