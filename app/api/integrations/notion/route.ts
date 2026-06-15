import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { title: string; content: string; database_id?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { title, content, database_id } = body
  if (!title || !content) {
    return Response.json({ error: 'Champs requis : title, content' }, { status: 400 })
  }

  const { data: creds } = await supabaseAdmin
    .from('user_integrations')
    .select('notion_token, notion_database_id')
    .eq('user_id', userId)
    .single()

  if (!creds?.notion_token) {
    return Response.json({ error: 'Notion non configuré. Ajoutez votre token dans les intégrations.' }, { status: 422 })
  }

  const dbId = database_id ?? creds.notion_database_id
  if (!dbId) {
    return Response.json({ error: 'ID de la base Notion manquant.' }, { status: 422 })
  }

  // Split content into 2000-char blocks (Notion API limit per rich text)
  const chunks: string[] = []
  for (let i = 0; i < content.length; i += 1900) {
    chunks.push(content.slice(i, i + 1900))
  }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${creds.notion_token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        title: { title: [{ text: { content: title } }] },
      },
      children: chunks.map((chunk) => ({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: chunk } }],
        },
      })),
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return Response.json({ error: err.message ?? 'Erreur Notion' }, { status: res.status })
  }

  const page = await res.json()
  return Response.json({ ok: true, url: page.url })
}
