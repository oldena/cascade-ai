import 'server-only'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase-admin'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { conversationId: string; message: string; agentSlug: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { conversationId, message, agentSlug } = body
  if (!conversationId || !message?.trim() || !agentSlug) {
    return new Response(JSON.stringify({ error: 'conversationId, message, and agentSlug are required' }), {
      status: 400,
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

  const pastMessages = (history ?? []).reverse().map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...pastMessages,
    { role: 'user', content: message },
  ]

  let fullResponse = ''

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      try {
        const response = await anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: agent.system_prompt,
          messages,
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullResponse += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(text)}\n\n`))
          }
        }

        const finalMessage = await response.finalMessage()
        const tokensUsed =
          finalMessage.usage.input_tokens + finalMessage.usage.output_tokens

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
            tokens_used: tokensUsed,
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
