'use client'

export function ProgressIndicator({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="w-12 h-12 border-4 border-cascade-border border-t-cascade-red rounded-full animate-spin" />
      <p className="text-cascade-muted text-sm">{message}</p>
    </div>
  )
}
