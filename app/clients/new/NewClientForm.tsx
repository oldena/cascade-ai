'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ClientProfileForm from '@/components/ClientProfileForm'

export default function NewClientForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }
      const { id } = await res.json()
      router.push(`/clients/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-6 bg-red-900/30 border border-cascade-red text-cascade-red rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <ClientProfileForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
