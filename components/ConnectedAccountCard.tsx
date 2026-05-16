import type { SocialAccount } from '@/types'

interface ConnectedAccountCardProps {
  account: SocialAccount
  onDisconnect: (id: string) => void
}

const PLATFORM_LABELS = { linkedin: 'LinkedIn', instagram: 'Instagram', twitter: 'X (Twitter)', tiktok: 'TikTok' }

export function ConnectedAccountCard({ account, onDisconnect }: ConnectedAccountCardProps) {
  return (
    <div className="bg-cascade-card border border-cascade-border rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {account.avatar_url ? (
          <img src={account.avatar_url} alt="" className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-cascade-dark border border-cascade-border flex items-center justify-center text-cascade-muted text-lg">
            {account.display_name[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-white font-medium text-sm">{account.display_name}</p>
          <p className="text-cascade-muted text-xs">{PLATFORM_LABELS[account.platform]}</p>
        </div>
      </div>
      <button
        onClick={() => onDisconnect(account.id)}
        className="text-cascade-muted hover:text-red-400 text-sm transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
}
