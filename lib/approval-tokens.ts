import 'server-only'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export function generateApprovalToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createApprovalLink(cascadeId: string): Promise<string> {
  const token = generateApprovalToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabaseAdmin.from('approval_links').insert({
    cascade_id: cascadeId,
    token,
    expires_at: expiresAt,
  })

  if (error) throw new Error(`Failed to create approval link: ${error.message}`)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return `${baseUrl}/approve/${token}`
}
