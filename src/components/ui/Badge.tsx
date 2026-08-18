interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'info' | 'purple'
  size?: 'sm' | 'md'
  style?: React.CSSProperties
}

const variantStyles: Record<string, React.CSSProperties> = {
  default:  { backgroundColor: 'rgba(255, 255, 255, 0.07)', color: '#a0a0b0' },
  positive: { backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#4ade80' },
  negative: { backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171' },
  warning:  { backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' },
  info:     { backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' },
  purple:   { backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' },
}

export function Badge({ children, variant = 'default', size = 'sm', style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '999px',
        fontWeight: 500,
        fontSize: size === 'sm' ? '11px' : '12px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  )
}
