import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { anthropic } from '@/lib/anthropic'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

const IMAGE_TYPES: Record<string, 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: JSON_HEADERS })
  }

  const body = await req.json()
  const { base64, filename, mimeType } = body as { base64: string; filename: string; mimeType: string }

  if (!base64 || !filename) {
    return new Response(JSON.stringify({ error: 'base64 and filename required' }), { status: 400, headers: JSON_HEADERS })
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const imageType = IMAGE_TYPES[ext]
  const isPdf = ext === 'pdf'

  if (!imageType && !isPdf) {
    return new Response(JSON.stringify({ error: `Type de fichier non supporté : .${ext}` }), { status: 400, headers: JSON_HEADERS })
  }

  try {
    const fileContent = isPdf
      ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 } }
      : { type: 'image' as const, source: { type: 'base64' as const, media_type: imageType, data: base64 } }

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            fileContent,
            {
              type: 'text',
              text: `Analyse ce fichier et extrait toutes les informations utiles pour une campagne marketing : marque, produit, slogan, couleurs dominantes, style visuel, textes visibles, cible apparente. Réponds en quelques phrases concises.`,
            },
          ],
        },
      ],
    })

    const content = msg.content[0]
    const description = content.type === 'text' ? content.text : ''

    return new Response(JSON.stringify({ description }), { status: 200, headers: JSON_HEADERS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: `Extraction échouée: ${msg}` }), { status: 500, headers: JSON_HEADERS })
  }
}
