import 'server-only'
import { Resend } from 'resend'
import { supabaseAdmin } from './supabase-admin'

export async function notifyPipelineComplete(
  userId: string,
  pipelineName: string,
  runId: string,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cascade-ai.com',
) {
  const { data: creds } = await supabaseAdmin
    .from('user_integrations')
    .select('resend_api_key, resend_from_email, resend_from_name, telegram_bot_token, telegram_chat_id')
    .eq('user_id', userId)
    .single()

  if (!creds) return

  const runUrl = `${appUrl}/pipeline?runId=${runId}`
  const msg = `✅ Pipeline *${pipelineName}* terminé !\n\nConsultez les résultats :\n${runUrl}`

  // Telegram
  const { telegram_bot_token: botToken, telegram_chat_id: chatId } = creds as {
    telegram_bot_token?: string | null
    telegram_chat_id?: string | null
    resend_api_key?: string | null
    resend_from_email?: string | null
    resend_from_name?: string | null
  }
  if (botToken && chatId) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
    }).catch(() => null)
  }

  // Email via Resend
  const { resend_api_key: apiKey, resend_from_email: fromEmail, resend_from_name: fromName } = creds as {
    telegram_bot_token?: string | null
    telegram_chat_id?: string | null
    resend_api_key?: string | null
    resend_from_email?: string | null
    resend_from_name?: string | null
  }
  if (apiKey && fromEmail) {
    const resend = new Resend(apiKey)
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail
    await resend.emails.send({
      from,
      to: fromEmail,
      subject: `✅ Pipeline "${pipelineName}" terminé — Cascade AI`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0a0a0b;color:#e8e8e8;border-radius:12px">
          <h2 style="color:#00d4aa;margin:0 0 16px">Pipeline terminé ✓</h2>
          <p style="color:#a0a0a8;margin:0 0 8px">Votre pipeline <strong style="color:#e8e8e8">${pipelineName}</strong> vient de se terminer avec succès.</p>
          <a href="${runUrl}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#00d4aa;color:#0a0a0b;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Voir les résultats →</a>
        </div>
      `,
    }).catch(() => null)
  }
}
