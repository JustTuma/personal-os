import { cn } from '@/lib/utils/cn'

interface ProgressBarProps {
  value: number         // 0–100
  max?: number
  size?: 'sm' | 'md'
  color?: string        // hex or css color
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, size = 'md', color, showLabel, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[rgb(var(--text-muted))] mb-1.5">
          <span>{Math.round(pct)}%</span>
          <span>{value.toLocaleString()} / {max.toLocaleString()}</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-white/6 overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color ?? 'rgb(99 102 241)',
          }}
        />
      </div>
    </div>
  )
}
