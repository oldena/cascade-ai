import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NavBar } from '@/components/NavBar'
import { PipelineClient } from './PipelineClient'

export interface PipelineRun {
  id: string
  user_id: string
  brief: string
  status: 'running' | 'done' | 'failed'
  outputs: Record<string, string>
  created_at: string
  name?: string
}

export default async function PipelinePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data, error } = await supabaseAdmin
    .from('pipeline_runs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('[pipeline] fetch pipeline_runs:', error.message)
  }

  const recentRuns: PipelineRun[] = (data ?? []) as PipelineRun[]

  return (
    <div className="min-h-screen bg-cascade-bg">
      <NavBar />
      <PipelineClient recentRuns={recentRuns} />
    </div>
  )
}
