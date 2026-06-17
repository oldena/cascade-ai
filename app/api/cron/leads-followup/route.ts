import 'server-only'
import { runLeadFollowups } from '@/lib/leads'

export async function GET(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runLeadFollowups()
  return Response.json({ ok: true, ...result })
}
