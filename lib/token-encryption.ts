export async function encrypt(text: string): Promise<string> {
  throw new Error('token-encryption: AES-256 not implemented — do not store tokens unencrypted')
}

export async function decrypt(text: string): Promise<string> {
  throw new Error('token-encryption: AES-256 not implemented — do not store tokens unencrypted')
}
