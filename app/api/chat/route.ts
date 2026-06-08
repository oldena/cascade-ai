import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type ImageAttachment = { name: string; dataUrl: string }

type MistralContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

type MistralMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string | MistralContentPart[] }
  | { role: 'assistant'; content: string }

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: {
    conversationId: string
    message: string
    agentSlug: string
    imageAttachments?: ImageAttachment[]
  }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { conversationId, message, agentSlug, imageAttachments = [] } = body
  if (!conversationId || !message?.trim() || !agentSlug) {
    return new Response(JSON.stringify({ error: 'conversationId, message, and agentSlug are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!process.env.MISTRAL_API_KEY) {
    return new Response(JSON.stringify({ error: 'MISTRAL_API_KEY manquant' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch agent system_prompt
  const { data: agent, error: agentError } = await supabaseAdmin
    .from('agents')
    .select('id, system_prompt')
    .eq('slug', agentSlug)
    .single()

  if (agentError || !agent) {
    return new Response(JSON.stringify({ error: 'Agent not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify conversation belongs to user
  const { data: conversation, error: convError } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (convError || !conversation) {
    return new Response(JSON.stringify({ error: 'Conversation not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch last 20 messages for context
  const { data: history } = await supabaseAdmin
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(20)

  const pastMessages: MistralMessage[] = (history ?? []).reverse().map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // Use pixtral for vision when images are attached
  const hasImages = imageAttachments.length > 0
  const model = hasImages ? 'pixtral-12b-2409' : 'mistral-small-latest'

  const userContent: string | MistralContentPart[] = hasImages
    ? [
        { type: 'text', text: message },
        ...imageAttachments.map((img) => ({
          type: 'image_url' as const,
          image_url: { url: img.dataUrl },
        })),
      ]
    : message

  const messages: MistralMessage[] = [
    ...pastMessages,
    { role: 'user', content: userContent },
  ]

  let fullResponse = ''

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            stream: true,
            messages: [
              { role: 'system', content: agent.system_prompt },
              ...messages,
            ],
          }),
        })

        if (!mistralRes.ok || !mistralRes.body) {
          const errText = await mistralRes.text().catch(() => mistralRes.status.toString())
          console.error('[chat] Mistral error:', errText)
          controller.enqueue(encoder.encode('data: [ERROR]\n\n'))
          controller.close()
          return
        }

        const reader = mistralRes.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let totalTokens: number | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === 'data: [DONE]') continue
            if (!trimmed.startsWith('data: ')) continue

            try {
              const json = JSON.parse(trimmed.slice(6))
              const text = json.choices?.[0]?.delta?.content ?? ''
              if (text) {
                fullResponse += text
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(text)}\n\n`))
              }
              if (json.usage?.total_tokens) {
                totalTokens = json.usage.total_tokens
              }
            } catch {
              // skip malformed chunk
            }
          }
        }

        // Save messages to DB
        await supabaseAdmin.from('messages').insert([
          {
            conversation_id: conversationId,
            role: 'user',
            content: message,
            tokens_used: null,
          },
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: fullResponse,
            tokens_used: totalTokens,
          },
        ])

        await supabaseAdmin
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId)

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        console.error('[chat] streaming error:', err)
        controller.enqueue(encoder.encode('data: [ERROR]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
