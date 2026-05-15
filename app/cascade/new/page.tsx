import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import { NavBar } from '@/components/NavBar'
import NewCascadeForm from './NewCascadeForm'

interface PageProps {
  searchParams: Promise<{ profile?: string }>
}

export default async function NewCascadePage({ searchParams }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const params = await searchParams
  const profileIdParam = params.profile

  const { data: profiles } = await supabaseAdmin
    .from('client_profiles')
    .select('id, name')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const profileList = profiles ?? []

  const defaultProfileId = profileIdParam && profileList.some((p) => p.id === profileIdParam)
    ? profileIdParam
    : (profileList[0]?.id ?? undefined)

  return (
    <div className="min-h-screen bg-cascade-dark">
      <NavBar />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-cascade-muted hover:text-white text-sm transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">New Cascade</h1>
          <p className="text-cascade-muted text-sm mt-1">
            Choose a client profile and paste your content to generate 6 formats instantly.
          </p>
        </div>

        {profileList.length === 0 ? (
          <div className="bg-cascade-card border border-dashed border-cascade-border rounded-xl p-10 text-center space-y-4">
            <p className="text-white font-semibold">No client profiles yet</p>
            <p className="text-cascade-muted text-sm">
              You need at least one client profile before generating a cascade.
            </p>
            <Link
              href="/clients/new"
              className="inline-block bg-cascade-red hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Create a Client Profile
            </Link>
          </div>
        ) : (
          <div className="bg-cascade-card border border-cascade-border rounded-xl p-8">
            <NewCascadeForm profiles={profileList} defaultProfileId={defaultProfileId} />
          </div>
        )}
      </main>
    </div>
  )
}
