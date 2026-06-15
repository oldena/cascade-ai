import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'
import Link from 'next/link'

export default async function ClientsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: clients } = await supabaseAdmin
    .from('client_profiles')
    .select('id, name, tone_words, cta_style, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const list = clients ?? []

  return (
    <div className="min-h-screen bg-cascade-bg">
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <p className="text-cascade-muted text-sm mt-1">{list.length} profil{list.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/clients/new"
            className="bg-cascade-teal hover:bg-cascade-teal/80 text-cascade-bg font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            + Nouveau client
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="bg-cascade-surface border border-cascade-border rounded-xl p-12 text-center">
            <p className="text-cascade-muted text-lg mb-4">Aucun client pour l&apos;instant</p>
            <Link
              href="/clients/new"
              className="bg-cascade-teal hover:bg-cascade-teal/80 text-cascade-bg font-semibold px-6 py-3 rounded-xl text-sm transition-colors inline-block"
            >
              + Créer mon premier client
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {list.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="bg-cascade-surface border border-cascade-border hover:border-cascade-teal/50 rounded-xl p-5 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-cascade-teal/15 border border-cascade-teal/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-cascade-teal font-bold text-sm">
                      {(client.name as string).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{client.name as string}</p>
                    {Array.isArray(client.tone_words) && client.tone_words.length > 0 && (
                      <p className="text-cascade-muted text-xs mt-0.5">
                        {(client.tone_words as string[]).slice(0, 4).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-cascade-muted group-hover:text-white transition-colors text-sm">
                  Voir →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
