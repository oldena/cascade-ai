import 'server-only'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { decrypt } from '@/lib/token-encryption'
import { executePublish } from '@/lib/publishers'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // 1. Validate Vercel Cron secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const expectedHeader = cronSecret ? `Bearer ${cronSecret}` : null

  if (!cronSecret || !expectedHeader || authHeader !== expectedHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Recover stale publish jobs (stuck in 'publishing' > 10 min → reset to 'pending')
  try {
    const { error: rpcError } = await supabaseAdmin.rpc('recover_stale_publish_jobs')
    if (rpcError) {
      console.error('[cron] recover_stale_publish_jobs RPC error:', rpcError.message)
    }
  } catch (err) {
    console.error('[cron] recover_stale_publish_jobs threw:', err)
    // Non-fatal — continue processing
  }

  // 3. Query due pending jobs (scheduled_for <= NOW(), limit 50)
  const { data: dueJobs, error: queryError } = await supabaseAdmin
    .from('publish_jobs')
    .select('id, output_id, social_account_id, platform')
    .eq('status', 'pending')
    .not('scheduled_for', 'is', null)
    .lte('scheduled_for', new Date().toISOString())
    .limit(50)

  if (queryError) {
    console.error('[cron] Failed to query due jobs:', queryError.message)
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  const jobs = dueJobs ?? []
  let succeeded = 0
  let failed = 0

  // 4. Process each due job
  for (const job of jobs) {
    try {
      // 4a. Claim the job by setting status to 'publishing'
      const { error: claimError } = await supabaseAdmin
        .from('publish_jobs')
        .update({ status: 'publishing' })
        .eq('id', job.id)
        .eq('status', 'pending') // optimistic lock — only claim if still pending

      if (claimError) {
        console.error(`[cron] Failed to claim job ${job.id}:`, claimError.message)
        failed++
        continue
      }

      // 4b. Fetch social account (for token + platform metadata)
      const { data: account, error: accountError } = await supabaseAdmin
        .from('social_accounts')
        .select('id, platform, platform_user_id, access_token, page_id')
        .eq('id', job.social_account_id)
        .single()

      if (accountError || !account) {
        const msg = accountError?.message ?? 'Account not found'
        console.error(`[cron] Job ${job.id} — account lookup failed:`, msg)
        await supabaseAdmin
          .from('publish_jobs')
          .update({ status: 'failed', error_message: msg })
          .eq('id', job.id)
        failed++
        continue
      }

      // 4c. Decrypt the social account token
      let accessToken: string
      try {
        accessToken = await decrypt(account.access_token)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Token decryption failed'
        console.error(`[cron] Job ${job.id} — token decrypt error:`, msg)
        await supabaseAdmin
          .from('publish_jobs')
          .update({ status: 'failed', error_message: msg })
          .eq('id', job.id)
        failed++
        continue
      }

      // 4d. Fetch the output content
      const { data: output, error: outputError } = await supabaseAdmin
        .from('outputs')
        .select('id, content, format')
        .eq('id', job.output_id)
        .single()

      if (outputError || !output) {
        const msg = outputError?.message ?? 'Output not found'
        console.error(`[cron] Job ${job.id} — output lookup failed:`, msg)
        await supabaseAdmin
          .from('publish_jobs')
          .update({ status: 'failed', error_message: msg })
          .eq('id', job.id)
        failed++
        continue
      }

      // 4e. Execute publish via shared dispatcher
      let postResult: { post_id: string; post_url: string }
      try {
        postResult = await executePublish(job.platform, accessToken, account, output)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Publish failed'
        console.error(`[cron] Job ${job.id} — executePublish error:`, msg)
        await supabaseAdmin
          .from('publish_jobs')
          .update({ status: 'failed', error_message: msg })
          .eq('id', job.id)
        failed++
        continue
      }

      // 4f. Mark job as published
      await supabaseAdmin
        .from('publish_jobs')
        .update({
          status: 'published',
          platform_post_id: postResult.post_id,
          platform_post_url: postResult.post_url,
          published_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      succeeded++
    } catch (err) {
      // Catch-all: log error, mark failed, never let one job crash the batch
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error(`[cron] Job ${job.id} — unexpected error:`, msg)
      try {
        await supabaseAdmin
          .from('publish_jobs')
          .update({ status: 'failed', error_message: msg })
          .eq('id', job.id)
      } catch (updateErr) {
        console.error(`[cron] Job ${job.id} — also failed to mark as failed:`, updateErr)
      }
      failed++
    }
  }

  // 5. Return summary
  return NextResponse.json({
    processed: jobs.length,
    succeeded,
    failed,
  })
}
