import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { anthropic } from '@/lib/anthropic'
import { buildSystemPrompt, FORMAT_PROMPTS } from '@/lib/prompts'
import { checkAndIncrementCascade } from '@/lib/limits'
import { sendCascadeCompleteEmail } from '@/lib/email'
import type { OutputFormat, ClientProfile } from '@/types'

const ALL_FORMATS: OutputFormat[] = ['linkedin', 'carousel', 'emails', 'reels', 'twitter_thread', 'newsletter']

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { input_text: string; client_profile_id: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { input_text, client_profile_id } = body

  if (!input_text?.trim()) return NextResponse.json({ error: 'input_text is required' }, { status: 400 })
  if (!client_profile_id) return NextResponse.json({ error: 'client_profile_id is required' }, { status: 400 })
  if (input_text.length > 50000) return NextResponse.json({ error: 'Content too long (max 50,000 chars)' }, { status: 400 })

  // Fetch user + plan
  const { data: user, error: userError } = await supabaseAdmin
    .from('users').select('plan').eq('id', userId).single()
  if (userError || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Verify profile ownership
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('client_profiles').select('*').eq('id', client_profile_id).eq('user_id', userId).single()
  if (profileError || !profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Atomic cascade limit check + increment
  const limitResult = await checkAndIncrementCascade(userId, user.plan)
  if (!limitResult.allowed) return NextResponse.json({ error: limitResult.reason }, { status: 403 })

  // Create cascade record
  const { data: cascade, error: cascadeError } = await supabaseAdmin
    .from('cascades')
    .insert({ user_id: userId, client_profile_id, input_text, status: 'generating' })
    .select('id').single()
  if (cascadeError || !cascade) return NextResponse.json({ error: 'Failed to create cascade' }, { status: 500 })

  const cascadeId = cascade.id
  const systemPrompt = buildSystemPrompt(profile as ClientProfile)
  const JSON_FORMATS: OutputFormat[] = ['carousel', 'emails', 'reels', 'twitter_thread']

  // Fire all 6 format calls in parallel
  const results = await Promise.allSettled(
    ALL_FORMATS.map(async (format) => {
      const userPrompt = FORMAT_PROMPTS[format](input_text)
      const max_tokens = JSON_FORMATS.includes(format) ? 4096 : 2048
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })
      const content = message.content[0]?.type === 'text' ? message.content[0].text : ''
      return { format, content }
    })
  )

  // Log individual format failures
  results.forEach((result, idx) => {
    if (result.status === 'rejected') {
      console.error(`[generate] format ${ALL_FORMATS[idx]} failed:`, result.reason)
    }
  })

  // Save all outputs
  const outputInserts = results.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return { cascade_id: cascadeId, format: result.value.format, content: result.value.content, status: 'done' }
    }
    return { cascade_id: cascadeId, format: ALL_FORMATS[idx], content: '', status: 'failed' }
  })

  const { error: outputError } = await supabaseAdmin.from('outputs').insert(outputInserts)
  if (outputError) {
    console.error('[generate] outputs insert failed:', outputError.message)
    // Still continue — cascade is created, log the issue
  }

  // Update cascade status: 'done' if at least 1 succeeded, 'failed' only if ALL failed
  const anySucceeded = results.some(r => r.status === 'fulfilled')
  await supabaseAdmin
    .from('cascades')
    .update({ status: anySucceeded ? 'done' : 'failed' })
    .eq('id', cascadeId)

  // Fire-and-forget: email the user when cascade generation completes
  if (anySucceeded) {
    try {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress
      if (userEmail) {
        const outputCount = results.filter(r => r.status === 'fulfilled').length
        sendCascadeCompleteEmail(userEmail, {
          cascadeName: (profile as ClientProfile).name,
          cascadeId,
          outputCount,
        }).catch(err => console.error('[generate] email send failed:', err))
      }
    } catch (err) {
      console.error('[generate] failed to fetch user email for notification:', err)
    }
  }

  return NextResponse.json({ cascade_id: cascadeId })
}
