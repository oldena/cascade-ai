import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { canCreateProfile } from '@/lib/limits'
import type { Plan } from '@/types'
import NewClientForm from './NewClientForm'
import Link from 'next/link'

export default async function NewClientPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan: Plan = (user?.plan as Plan) ?? 'starter'
  const limitCheck = await canCreateProfile(userId, plan)

  if (!limitCheck.allowed) {
    return (
      <div className="min-h-screen bg-cascade-dark flex items-center justify-center p-6">
        <div className="bg-cascade-card border border-cascade-border rounded-xl p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-bold text-white">Profile Limit Reached</h1>
          <p className="text-cascade-muted text-sm">
            {limitCheck.reason} ({limitCheck.current}/{limitCheck.limit} used). Upgrade your plan
            to create more client profiles.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/dashboard"
              className="border border-cascade-border text-white px-5 py-2 rounded-lg text-sm hover:border-cascade-red transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/billing"
              className="bg-cascade-red hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold text-white mt-4">New Client Profile</h1>
          <p className="text-cascade-muted text-sm mt-1">
            {limitCheck.current}/{limitCheck.limit} profiles used on your {plan} plan
          </p>
        </div>
        <div className="bg-cascade-card border border-cascade-border rounded-xl p-8">
          <NewClientForm />
        </div>
      </div>
    </div>
  )
}
