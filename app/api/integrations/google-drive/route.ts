import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { fileName, content, mimeType } = await req.json() as {
    fileName?: string
    content?: string
    mimeType?: string
  }

  if (!fileName || !content) {
    return Response.json({ error: 'fileName and content required' }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from('user_integrations')
    .select('gdrive_service_account_json, gdrive_folder_id')
    .eq('user_id', userId)
    .single()

  if (!data?.gdrive_service_account_json) {
    return Response.json({ error: 'Google Drive non configuré' }, { status: 400 })
  }

  let serviceAccount: {
    client_email: string
    private_key: string
  }
  try {
    serviceAccount = JSON.parse(data.gdrive_service_account_json)
  } catch {
    return Response.json({ error: 'Service account JSON invalide' }, { status: 400 })
  }

  // Get OAuth2 token via JWT
  const token = await getServiceAccountToken(serviceAccount.client_email, serviceAccount.private_key)

  // Upload to Drive
  const fileMime = mimeType ?? 'text/plain'
  const metadata = {
    name: fileName,
    mimeType: fileMime,
    ...(data.gdrive_folder_id ? { parents: [data.gdrive_folder_id] } : {}),
  }

  const boundary = '-------cascade_boundary'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`
  const body =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${fileMime}\r\n\r\n` +
    content +
    closeDelimiter

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    return Response.json({ error: `Drive API error: ${err}` }, { status: 502 })
  }

  const file = await uploadRes.json() as { id: string; name: string }
  return Response.json({ ok: true, fileId: file.id, fileName: file.name })
}

// ── JWT / token helpers ──────────────────────────────────────────────────────

async function getServiceAccountToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify(claim))
  const signingInput = `${header}.${payload}`

  const key = await importPrivateKey(privateKey)
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput)
  )

  const jwt = `${signingInput}.${base64url(signature)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(data.error ?? 'Token request failed')
  return data.access_token
}

function base64url(input: string | ArrayBuffer): string {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
}
