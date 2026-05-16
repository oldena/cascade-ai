import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [userRes, accountsRes] = await Promise.all([
    supabaseAdmin.from('users').select('plan, cascade_count_this_month, billing_period_start, email').eq('id', userId).single(),
    supabaseAdmin.from('social_accounts').select('id, platform, display_name, avatar_url, connected_at, page_id').eq('user_id', userId).order('connected_at'),
  ])

  const user = userRes.data
  const accounts = accountsRes.data ?? []

  return (
    <div className="min-h-screen bg-cascade-dark">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>
        <SettingsClient user={user} accounts={accounts as any} />
      </div>
    </div>
  )
}
