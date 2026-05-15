import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { ClientProfile } from '@/types'
import EditClientForm from './EditClientForm'
import Link from 'next/link'

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params

  const { data } = await supabaseAdmin
    .from('client_profiles')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!data) notFound()

  const profile = data as ClientProfile

  return (
    <div className="min-h-screen bg-cascade-dark p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-cascade-muted hover:text-white text-sm transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">{profile.name}</h1>
          <p className="text-cascade-muted text-sm mt-1">Edit client profile</p>
        </div>
        <div className="bg-cascade-card border border-cascade-border rounded-xl p-8">
          <EditClientForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
