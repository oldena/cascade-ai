interface RadialGaugeProps {
  value: number
  max: number
  label: string
  sublabel?: string
  size?: number
  color?: string
}

export function RadialGauge({ value, max, label, sublabel, size = 96, color = '#C85440' }: RadialGaugeProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct / 100)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#132340"
            strokeWidth={8}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold text-cascade-text tabular-nums">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-cascade-muted uppercase tracking-widest">{label}</p>
        {sublabel && <p className="text-xs text-cascade-text-2 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}
