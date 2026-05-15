import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export function NavBar() {
  return (
    <nav className="border-b border-cascade-border bg-cascade-card px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-xl font-bold text-white tracking-tight">
          Cascade
        </Link>
        <div className="flex gap-6">
          <Link href="/dashboard" className="text-cascade-muted hover:text-white transition-colors text-sm">Dashboard</Link>
          <Link href="/settings" className="text-cascade-muted hover:text-white transition-colors text-sm">Settings</Link>
        </div>
      </div>
      <UserButton />
    </nav>
  )
}
