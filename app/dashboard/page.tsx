import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Link from 'next/link'
import { NavBar } from '@/components/NavBar'
import { formatDate, truncate } from '@/lib/utils'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [userRes, profilesRes, cascadesRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('plan, cascade_count_this_month')
      .eq('id', userId)
      .single(),
    supabaseAdmin
      .from('client_profiles')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('cascades')
      .select('id, status, input_text, created_at, client_profile_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (userRes.error) {
    // User row missing — likely sync delay after Clerk signup
    redirect('/sign-in')
  }
  // For profiles and cascades, log errors but degrade gracefully
  if (profilesRes.error) console.error('[dashboard] profiles fetch:', profilesRes.error.message)
  if (cascadesRes.error) console.error('[dashboard] cascades fetch:', cascadesRes.error.message)

  const user = userRes.data
  const profiles = profilesRes.data ?? []
  const cascades = cascadesRes.data ?? []

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.name]))

  const plan = user?.plan ?? 'starter'
  const cascadeCount = user?.cascade_count_this_month ?? 0

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
      generating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      done: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      pending: 'bg-cascade-border text-cascade-muted border-cascade-border',
    }
    const cls = map[status] ?? map['pending']
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-cascade-dark">
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Stats row */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="bg-cascade-card border border-cascade-border rounded-xl px-6 py-4 flex flex-col gap-1">
            <span className="text-cascade-muted text-xs uppercase tracking-wide">Active Clients</span>
            <span className="text-2xl font-bold text-white">{profiles.length}</span>
          </div>
          <div className="bg-cascade-card border border-cascade-border rounded-xl px-6 py-4 flex flex-col gap-1">
            <span className="text-cascade-muted text-xs uppercase tracking-wide">Cascades This Month</span>
            <span className="text-2xl font-bold text-white">{cascadeCount}</span>
          </div>
          <div className="bg-cascade-card border border-cascade-border rounded-xl px-6 py-4 flex flex-col gap-1">
            <span className="text-cascade-muted text-xs uppercase tracking-wide">Plan</span>
            <span
              className={`mt-1 inline-block text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                plan === 'agency'
                  ? 'bg-cascade-red/20 text-cascade-red border border-cascade-red/30'
                  : 'bg-cascade-border text-cascade-muted border border-cascade-border'
              }`}
            >
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
          </div>
          <div className="ml-auto">
            <Link
              href="/clients/new"
              className="bg-cascade-red hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              + New Client
            </Link>
          </div>
        </div>

        {/* Your Clients */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Your Clients</h2>
          {profiles.length === 0 ? (
            <div className="bg-cascade-card border border-dashed border-cascade-border rounded-xl p-10 text-center">
              <p className="text-cascade-muted text-sm mb-4">No client profiles yet.</p>
              <Link
                href="/clients/new"
                className="inline-block bg-cascade-red hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Create your first client
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-cascade-card border border-cascade-border rounded-xl p-5 flex flex-col gap-3 hover:border-cascade-red transition-colors"
                >
                  <div>
                    <h3 className="text-white font-semibold">{profile.name}</h3>
                    <p className="text-cascade-muted text-xs mt-1">
                      Created {formatDate(profile.created_at)}
                    </p>
                  </div>
                  <Link
                    href={`/cascade/new?profile=${profile.id}`}
                    className="mt-auto text-sm text-cascade-red hover:text-red-400 font-medium transition-colors"
                  >
                    New Cascade &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Cascades */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Cascades</h2>
          {cascades.length === 0 ? (
            <div className="bg-cascade-card border border-dashed border-cascade-border rounded-xl p-10 text-center">
              <p className="text-cascade-muted text-sm">
                No cascades yet. Select a client and generate your first cascade.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cascades.map((cascade) => (
                <Link
                  key={cascade.id}
                  href={`/cascade/${cascade.id}`}
                  className="flex items-center justify-between bg-cascade-card border border-cascade-border rounded-xl px-5 py-4 hover:border-cascade-red transition-colors group"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={cascade.status} />
                      {profileMap[cascade.client_profile_id] && (
                        <span className="text-cascade-muted text-xs">
                          {profileMap[cascade.client_profile_id]}
                        </span>
                      )}
                      <span className="text-cascade-muted text-xs">
                        {formatDate(cascade.created_at)}
                      </span>
                    </div>
                    <p className="text-white text-sm truncate">
                      {truncate(cascade.input_text, 60)}
                    </p>
                  </div>
                  <span className="text-cascade-muted group-hover:text-cascade-red text-sm ml-4 flex-shrink-0 transition-colors">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
