import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const META_API = 'https://graph.facebook.com/v19.0'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: creds } = await supabaseAdmin
    .from('user_integrations')
    .select('meta_access_token, meta_ad_account_id')
    .eq('user_id', userId)
    .single()

  const accessToken = creds?.meta_access_token
  const adAccountId = creds?.meta_ad_account_id
  if (!accessToken || !adAccountId) {
    return Response.json({ error: 'Meta Ads non configuré. Rendez-vous dans Intégrations pour renseigner vos identifiants.' }, { status: 503 })
  }

  let body: { campaignName: string; objective?: string; dailyBudget?: number }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { campaignName, objective = 'OUTCOME_AWARENESS', dailyBudget = 1000 } = body
  if (!campaignName?.trim()) {
    return Response.json({ error: 'campaignName required' }, { status: 400 })
  }

  const campaignRes = await fetch(
    `${META_API}/act_${adAccountId}/campaigns?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: campaignName,
        objective,
        status: 'PAUSED',
        special_ad_categories: [],
        daily_budget: dailyBudget,
      }),
    }
  )

  if (!campaignRes.ok) {
    const errText = await campaignRes.text().catch(() => campaignRes.status.toString())
    return Response.json({ error: `Meta Ads ${campaignRes.status}: ${errText}` }, { status: 500 })
  }

  const data = await campaignRes.json()
  return Response.json({ success: true, campaignId: data?.id ?? null })
}
