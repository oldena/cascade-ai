export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('white_label_settings')
    .select('company_name, logo_url, primary_color, custom_domain')
    .eq('user_id', userId)
    .single()

  return Response.json(data ?? { company_name: '', logo_url: '', primary_color: '#6366f1', custom_domain: null })
}

export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    company_name?: string
    logo_url?: string
    primary_color?: string
    custom_domain?: string | null
  }

  const { error } = await supabaseAdmin
    .from('white_label_settings')
    .upsert({
      user_id: userId,
      company_name: body.company_name ?? '',
      logo_url: body.logo_url ?? '',
      primary_color: body.primary_color ?? '#6366f1',
      custom_domain: body.custom_domain ?? null,
      updated_at: new Date().toISOString(),
    })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
