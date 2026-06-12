'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export function NavBar() {
  return (
    <nav className="h-16 border-b border-cascade-border bg-transparent px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cascade-red flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm leading-none">C</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-cascade-text font-bold text-base tracking-wide">Cascade AI</span>
            <span className="text-cascade-muted text-[9px] tracking-widest uppercase">Multi-Agent Platform</span>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex gap-6">
          <Link
            href="/dashboard"
            className="text-cascade-text-2 hover:text-cascade-text transition-colors text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/pipeline"
            className="text-cascade-text-2 hover:text-cascade-text transition-colors text-sm"
          >
            Pipeline
          </Link>
          <Link
            href="/calendar"
            className="text-cascade-text-2 hover:text-cascade-text transition-colors text-sm"
          >
            Calendrier
          </Link>
          <Link
            href="/analytics"
            className="text-cascade-text-2 hover:text-cascade-text transition-colors text-sm"
          >
            Analytics
          </Link>
        </div>
      </div>

      {/* Right: user avatar */}
      <UserButton />
    </nav>
  )
}
