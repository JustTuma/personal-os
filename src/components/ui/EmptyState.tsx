import { LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      {Icon && (
        <div style={{
          position: 'relative',
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <Icon size={24} color="#7c3aed" />
        </div>
      )}
      <p style={{ fontSize: '15px', fontWeight: 700, color: '#eeeeff', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
        {title}
      </p>
      {description && (
        <p style={{ fontSize: '13px', color: '#7070a0', margin: 0, maxWidth: '320px', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div style={{ marginTop: '20px' }}>
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
