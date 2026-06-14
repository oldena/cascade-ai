import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('id, slug, name, role, specialty, system_prompt, avatar_emoji, avatar_color')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ agents: data ?? [] })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name: string; specialty: string; system_prompt: string; avatar_emoji?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, specialty, system_prompt, avatar_emoji } = body
  if (!name?.trim() || !specialty?.trim() || !system_prompt?.trim()) {
    return NextResponse.json({ error: 'name, specialty, system_prompt sont requis' }, { status: 400 })
  }

  // Count existing custom agents — limit 10 per user
  const { count } = await supabaseAdmin
    .from('agents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count ?? 0) >= 10) {
    return NextResponse.json({ error: 'Maximum 10 agents personnalisés par compte' }, { status: 400 })
  }

  const slug = `custom-${userId.slice(-8)}-${Date.now()}`

  const { data, error } = await supabaseAdmin
    .from('agents')
    .insert({
      slug,
      name: name.trim(),
      role: 'assistant',
      specialty: specialty.trim(),
      system_prompt: system_prompt.trim(),
      avatar_emoji: avatar_emoji?.trim() || '🤖',
      avatar_color: '#1a2e20',
      user_id: userId,
    })
    .select('id, slug, name, specialty, system_prompt, avatar_emoji')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ agent: data })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('agents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
