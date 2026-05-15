export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { canCreateProfile } from '@/lib/limits'
import type { Plan } from '@/types'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan: Plan = (user?.plan as Plan) ?? 'starter'

  const limitCheck = await canCreateProfile(userId, plan)
  if (!limitCheck.allowed) {
    return Response.json({ error: limitCheck.reason }, { status: 403 })
  }

  const formData = await req.formData()
  const name = (formData.get('name') as string | null)?.trim()
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

  let tone_words: string[] = []
  let example_posts: string[] = []
  let avoid_topics: string[] = []
  try {
    const tw = formData.get('tone_words')
    if (tw) tone_words = JSON.parse(tw as string)
    const ep = formData.get('example_posts')
    if (ep) example_posts = JSON.parse(ep as string)
    const at = formData.get('avoid_topics')
    if (at) avoid_topics = JSON.parse(at as string)
  } catch {
    return Response.json({ error: 'Invalid JSON in form fields' }, { status: 400 })
  }

  const cta_style = (formData.get('cta_style') as string | null) ?? ''

  const { data, error } = await supabaseAdmin
    .from('client_profiles')
    .insert({
      user_id: userId,
      name,
      tone_words,
      example_posts,
      avoid_topics,
      cta_style,
    })
    .select('id')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ id: data.id }, { status: 201 })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('client_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json(data)
}
