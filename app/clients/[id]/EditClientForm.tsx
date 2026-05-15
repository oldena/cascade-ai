'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ClientProfileForm from '@/components/ClientProfileForm'
import type { ClientProfile } from '@/types'

interface EditClientFormProps {
  profile: ClientProfile
}

export default function EditClientForm({ profile }: EditClientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients/${profile.id}`, {
        method: 'PUT',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this client profile? This cannot be undone.')) return
    setIsDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/clients/${profile.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-6 bg-red-900/30 border border-cascade-red text-cascade-red rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <ClientProfileForm
        initialData={profile}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <div className="mt-8 pt-6 border-t border-cascade-border">
        <p className="text-cascade-muted text-sm mb-3">Danger Zone</p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="border border-cascade-red text-cascade-red hover:bg-cascade-red hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete Profile'}
        </button>
      </div>
    </div>
  )
}
