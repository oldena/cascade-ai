import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'
import { CascadeResults } from './CascadeResults'

export default async function CascadePage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params

  const { data: cascade, error } = await supabaseAdmin
    .from('cascades')
    .select('*, client_profiles(name)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !cascade) notFound()

  const [outputsRes, accountsRes] = await Promise.all([
    supabaseAdmin
      .from('outputs')
      .select('*')
      .eq('cascade_id', id)
      .order('created_at'),
    supabaseAdmin
      .from('social_accounts')
      .select('id, platform, display_name, avatar_url, connected_at, page_id')
      .eq('user_id', userId),
  ])

  const outputs = outputsRes.data
  const accounts = accountsRes.data ?? []

  return (
    <div className="min-h-screen bg-cascade-dark">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-2">
          <a href="/dashboard" className="text-cascade-muted hover:text-white text-sm transition-colors">← Dashboard</a>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Generated Content</h1>
        <p className="text-cascade-muted mb-8">
          For {(cascade as any).client_profiles?.name ?? 'Unknown client'} · {new Date(cascade.created_at).toLocaleDateString()}
        </p>
        <CascadeResults outputs={outputs ?? []} cascadeId={id} connectedAccounts={accounts as any} />
      </div>
    </div>
  )
}
