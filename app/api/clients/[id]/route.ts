export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: existing } = await supabaseAdmin
    .from('client_profiles')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

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

  const { error } = await supabaseAdmin
    .from('client_profiles')
    .update({ name, tone_words, example_posts, avoid_topics, cta_style })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: existing } = await supabaseAdmin
    .from('client_profiles')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('client_profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
