'use client'
import { useState } from 'react'

interface SchedulePickerProps {
  onSchedule: (dateTime: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function SchedulePicker({ onSchedule, onCancel, isLoading }: SchedulePickerProps) {
  const [value, setValue] = useState('')
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="bg-cascade-card border border-cascade-border rounded-xl p-4 mt-2">
      <p className="text-white text-sm font-medium mb-3">Schedule post</p>
      <input
        type="datetime-local"
        value={value}
        min={minDateTime}
        onChange={e => setValue(e.target.value)}
        className="w-full bg-cascade-dark border border-cascade-border text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cascade-red mb-3"
      />
      <div className="flex gap-2">
        <button
          onClick={() => value && onSchedule(new Date(value).toISOString())}
          disabled={!value || isLoading}
          className="bg-cascade-red hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Scheduling...' : 'Schedule'}
        </button>
        <button onClick={onCancel} className="text-cascade-muted hover:text-white text-sm px-4 py-2 border border-cascade-border rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
