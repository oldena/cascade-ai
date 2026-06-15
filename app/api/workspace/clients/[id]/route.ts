import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let body: { name?: string; company_context?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const fields: Record<string, string | null> = { updated_at: new Date().toISOString() }
  if (body.name?.trim()) fields.name = body.name.trim()
  if (typeof body.company_context === 'string') fields.company_context = body.company_context || null

  const { data, error } = await supabaseAdmin
    .from('clients')
    .update(fields)
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, name, company_context, created_at')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
