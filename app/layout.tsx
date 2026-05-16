import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Cascade — AI Content Repurposing',
  description: 'Transform long-form content into 6 formats instantly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} bg-cascade-bg text-cascade-text`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
