// Netlify scheduled function — triggers daily lead follow-up ("relance") emails/WhatsApp
export default async () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cascade-ai.com'
  const res = await fetch(`${appUrl}/api/cron/leads-followup`, {
    headers: { 'x-cron-secret': process.env.CRON_SECRET ?? '' },
  })
  if (!res.ok) {
    console.error('[leads-followup-cron] failed:', res.status, await res.text())
  }
}

export const config = {
  schedule: '@daily',
}
