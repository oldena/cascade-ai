import { supabaseAdmin } from '@/lib/supabase-admin'
import { ApprovePageClient } from './ApprovePageClient'

export default async function ApprovePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Fetch approval link
  const { data: link } = await supabaseAdmin
    .from('approval_links')
    .select('id, cascade_id, expires_at, consumed_at')
    .eq('token', token)
    .single()

  // Validate: exists, not expired, not consumed
  const isInvalid =
    !link ||
    new Date(link.expires_at) < new Date() ||
    link.consumed_at !== null

  if (isInvalid) {
    return (
      <div className="min-h-screen bg-cascade-dark flex items-center justify-center px-4">
        <div className="bg-cascade-card border border-cascade-border rounded-xl p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">&#128279;</div>
          <h1 className="text-xl font-bold text-white mb-2">Link expired or already used</h1>
          <p className="text-cascade-muted text-sm">
            This approval link is no longer valid. Please ask the sender to generate a new one.
          </p>
        </div>
      </div>
    )
  }

  // Fetch cascade + client profile
  const { data: cascade } = await supabaseAdmin
    .from('cascades')
    .select('id, input_text, created_at, client_profiles(name)')
    .eq('id', link.cascade_id)
    .single()

  // Fetch outputs
  const { data: outputs } = await supabaseAdmin
    .from('outputs')
    .select('id, format, content, status')
    .eq('cascade_id', link.cascade_id)
    .order('created_at')

  const clientName = (cascade as any)?.client_profiles?.name ?? 'Unknown client'
  const createdAt = cascade?.created_at
    ? new Date(cascade.created_at).toLocaleDateString()
    : ''

  return (
    <ApprovePageClient
      token={token}
      clientName={clientName}
      createdAt={createdAt}
      outputs={(outputs ?? []) as Array<{ id: string; format: string; content: string; status: string }>}
    />
  )
}
