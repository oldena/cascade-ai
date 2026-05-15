import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

export function generateToken(length = 32): string {
  return Buffer.from(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('crypto').randomBytes(Math.ceil(length * 3 / 4))
  ).toString('base64url').slice(0, length)
}
