import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('id, name, company_context, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name: string; company_context?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const name = body.name?.trim()
  if (!name) return Response.json({ error: 'name requis' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert({ user_id: userId, name, company_context: body.company_context ?? null })
    .select('id, name, company_context, created_at')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
