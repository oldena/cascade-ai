import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId')
  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
  }

  // Verify the conversation belongs to the user
  const { data: conv, error: convError } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (convError || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[messages] fetch error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
