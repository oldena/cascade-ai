import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { decrypt } from '@/lib/token-encryption'
import { publishToLinkedIn } from '@/lib/publishers/linkedin'
import { publishToInstagram } from '@/lib/publishers/instagram'
import { publishTwitterThread, publishSingleTweet } from '@/lib/publishers/twitter'
import { publishTikTokDraft } from '@/lib/publishers/tiktok'
import type { Platform } from '@/types'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { output_id: string; social_account_id: string; scheduled_for?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { output_id, social_account_id, scheduled_for } = body
  if (!output_id || !social_account_id) {
    return NextResponse.json({ error: 'output_id and social_account_id required' }, { status: 400 })
  }

  // Verify output ownership
  const { data: output } = await supabaseAdmin
    .from('outputs')
    .select('id, content, format, cascades!inner(user_id)')
    .eq('id', output_id)
    .single()

  if (!output || (output as any).cascades?.user_id !== userId) {
    return NextResponse.json({ error: 'Output not found' }, { status: 404 })
  }

  // Verify account ownership
  const { data: account } = await supabaseAdmin
    .from('social_accounts')
    .select('*')
    .eq('id', social_account_id)
    .eq('user_id', userId)
    .single()

  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

  // If scheduled, create a pending job and return
  if (scheduled_for) {
    const { data: job, error } = await supabaseAdmin.from('publish_jobs').insert({
      output_id,
      social_account_id,
      platform: account.platform,
      status: 'pending',
      scheduled_for,
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ job_id: job.id, scheduled: true })
  }

  // Publish now — create job record
  const { data: job, error: jobError } = await supabaseAdmin.from('publish_jobs').insert({
    output_id,
    social_account_id,
    platform: account.platform,
    status: 'publishing',
  }).select('id').single()
  if (jobError) return NextResponse.json({ error: jobError.message }, { status: 500 })

  // Decrypt token
  const accessToken = await decrypt(account.access_token)
  const platform = account.platform as Platform

  let postResult: { post_id: string; post_url: string }
  try {
    postResult = await executePublish(platform, accessToken, account, output as any)
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Unknown error'
    await supabaseAdmin.from('publish_jobs').update({
      status: 'failed',
      error_message: errMsg,
    }).eq('id', job.id)
    return NextResponse.json({ error: errMsg }, { status: 502 })
  }

  await supabaseAdmin.from('publish_jobs').update({
    status: 'published',
    platform_post_id: postResult.post_id,
    platform_post_url: postResult.post_url,
    published_at: new Date().toISOString(),
  }).eq('id', job.id)

  return NextResponse.json({ job_id: job.id, post_url: postResult.post_url })
}

async function executePublish(
  platform: Platform,
  accessToken: string,
  account: any,
  output: any
): Promise<{ post_id: string; post_url: string }> {
  const content: string = output.content
  const format: string = output.format

  switch (platform) {
    case 'linkedin': {
      return publishToLinkedIn(accessToken, content, account.platform_user_id, !!account.page_id)
    }
    case 'instagram': {
      return publishToInstagram(accessToken, account.platform_user_id, content)
    }
    case 'twitter': {
      // For twitter_thread format, parse JSON array of tweets
      if (format === 'twitter_thread') {
        try {
          const tweets = JSON.parse(content) as Array<{ content: string }>
          return publishTwitterThread(accessToken, tweets)
        } catch {
          return publishSingleTweet(accessToken, content)
        }
      }
      return publishSingleTweet(accessToken, content)
    }
    case 'tiktok': {
      return publishTikTokDraft(accessToken, content)
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
