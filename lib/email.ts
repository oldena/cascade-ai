import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@cascade.app'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cascade.app'

export async function sendCascadeCompleteEmail(
  to: string,
  data: { cascadeName: string; cascadeId: string; outputCount: number }
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Your cascade is ready — ${data.cascadeName}`,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="margin-bottom:8px">Your cascade is ready</h2>
  <p>Your <strong>${data.outputCount}</strong> content piece${data.outputCount !== 1 ? 's' : ''} for <strong>${escHtml(data.cascadeName)}</strong> ${data.outputCount !== 1 ? 'are' : 'is'} ready.</p>
  <p><a href="${APP_URL}/cascade/${data.cascadeId}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600">View your content</a></p>
  <p style="color:#666;font-size:13px;margin-top:24px">This email was sent by Cascade.</p>
</body>
</html>`,
    })
  } catch (err) {
    console.error('[email] sendCascadeCompleteEmail failed:', err)
  }
}

export async function sendApprovalRequestEmail(
  to: string,
  data: { clientName: string; cascadeName: string; approvalUrl: string }
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Content ready for your review — ${data.cascadeName}`,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="margin-bottom:8px">Content ready for your review</h2>
  <p>Hi ${escHtml(data.clientName)},</p>
  <p>Your content for <strong>${escHtml(data.cascadeName)}</strong> is ready for review.</p>
  <p><a href="${data.approvalUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600">Approve or request changes</a></p>
  <p style="color:#666;font-size:13px;margin-top:24px">This link expires in 7 days. Sent by Cascade.</p>
</body>
</html>`,
    })
  } catch (err) {
    console.error('[email] sendApprovalRequestEmail failed:', err)
  }
}

export async function sendApprovalCompleteEmail(
  to: string,
  data: { cascadeName: string; action: 'approved' | 'needs_revision'; comment?: string }
): Promise<void> {
  const isApproved = data.action === 'approved'
  const actionLabel = isApproved ? 'approved' : 'requested changes on'
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Client ${actionLabel} — ${data.cascadeName}`,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="margin-bottom:8px">Client ${escHtml(actionLabel)}</h2>
  <p>Your client has <strong>${escHtml(actionLabel)}</strong> the content for <strong>${escHtml(data.cascadeName)}</strong>.</p>
  ${data.comment ? `<p><strong>Client note:</strong></p><blockquote style="border-left:3px solid #ddd;margin:0;padding:8px 16px;color:#444">${escHtml(data.comment)}</blockquote>` : ''}
  <p style="color:#666;font-size:13px;margin-top:24px">This email was sent by Cascade.</p>
</body>
</html>`,
    })
  } catch (err) {
    console.error('[email] sendApprovalCompleteEmail failed:', err)
  }
}

/** Minimal HTML escaping to prevent XSS in email body */
function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
