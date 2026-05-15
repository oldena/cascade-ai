import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // bytes for AES-256
const IV_LENGTH = 12  // bytes for GCM
const AUTH_TAG_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.SUPABASE_ENCRYPTION_KEY
  if (!key) throw new Error('SUPABASE_ENCRYPTION_KEY is not set')
  const buf = Buffer.from(key, 'hex')
  if (buf.length !== KEY_LENGTH) {
    throw new Error(`SUPABASE_ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex chars (got ${buf.length * 2})`)
  }
  return buf
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns: base64(iv + authTag + ciphertext)
 */
export async function encrypt(text: string): Promise<string> {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  // Format: iv (12) + authTag (16) + ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted])
  return combined.toString('base64')
}

/**
 * Decrypts a base64 string produced by encrypt().
 */
export async function decrypt(text: string): Promise<string> {
  const key = getKey()
  const combined = Buffer.from(text, 'base64')
  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('decrypt: ciphertext too short — data may be corrupted')
  }

  const iv = combined.subarray(0, IV_LENGTH)
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
