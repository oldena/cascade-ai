import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ALL_FIELDS = [
  'metricool_token', 'metricool_username',
  'meta_access_token', 'meta_ad_account_id',
  'resend_api_key', 'resend_from_email', 'resend_from_name',
  'notion_token', 'notion_database_id',
  'whatsapp_token', 'whatsapp_phone_id',
  'telegram_bot_token', 'telegram_chat_id',
  'company_context',
  'gdrive_service_account_json', 'gdrive_folder_id',
] as const

type FieldKey = typeof ALL_FIELDS[number]

const SECRET_FIELDS = new Set<FieldKey>([
  'metricool_token', 'meta_access_token',
  'resend_api_key', 'notion_token',
  'whatsapp_token', 'telegram_bot_token',
  'gdrive_service_account_json',
])

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('user_integrations')
    .select(ALL_FIELDS.join(', '))
    .eq('user_id', userId)
    .single()

  const result: Record<string, string> = {}
  const row = data as Record<string, string | null> | null
  for (const key of ALL_FIELDS) {
    const val = row?.[key]
    if (SECRET_FIELDS.has(key)) {
      result[key] = val ? '••••••••' : ''
    } else {
      result[key] = val ?? ''
    }
  }

  return Response.json(result)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const fields: Record<string, string> = {}
  for (const key of ALL_FIELDS) {
    if (typeof body[key] === 'string' && body[key].trim() !== '' && body[key] !== '••••••••') {
      fields[key] = body[key].trim()
    }
  }

  await supabaseAdmin
    .from('user_integrations')
    .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  return Response.json({ ok: true })
}
