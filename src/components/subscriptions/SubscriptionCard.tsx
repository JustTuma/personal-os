'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pencil, Trash2, CheckCircle2, Pause, Play, Calendar, AlertTriangle } from 'lucide-react'
import type { SubscriptionWithRelations } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

interface SubscriptionCardProps {
  subscription: SubscriptionWithRelations
  onEdit: (sub: SubscriptionWithRelations) => void
  onDelete: (sub: SubscriptionWithRelations) => void
  onToggleActive: (id: string, current: boolean) => void
  onRegisterPayment: (sub: SubscriptionWithRelations) => void
}

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: 'Mensual',
  annual:  'Anual',
  weekly:  'Semanal',
  custom:  'Custom',
}

export function SubscriptionCard({
  subscription, onEdit, onDelete, onToggleActive, onRegisterPayment,
}: SubscriptionCardProps) {
  const daysUntil = differenceInDays(parseISO(subscription.next_payment_date), new Date())

  let monthlyEquivalent = subscription.amount
  if (subscription.frequency === 'annual') monthlyEquivalent = subscription.amount / 12
  if (subscription.frequency === 'weekly') monthlyEquivalent = subscription.amount * 4.33
  if (subscription.frequency === 'custom' && subscription.custom_days) {
    monthlyEquivalent = (subscription.amount / subscription.custom_days) * 30
  }

  const isUrgent = daysUntil >= 0 && daysUntil <= 3 && subscription.is_active
  const isPastDue = daysUntil < 0 && subscription.is_active
  const isActive = subscription.is_active

  // accent color based on urgency
  const accent = isPastDue ? '#ef4444' : isUrgent ? '#f59e0b' : isActive ? '#7c3aed' : '#444455'

  let dueDateText = ''
  if (isPastDue) dueDateText = `Venció el ${subscription.next_payment_date}`
  else if (daysUntil === 0) dueDateText = 'Vence hoy'
  else if (daysUntil === 1) dueDateText = 'Vence mañana'
  else dueDateText = `${daysUntil}d · ${subscription.next_payment_date}`

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '18px 20px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${accent}25`,
        opacity: isActive ? 1 : 0.55,
        transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${accent}50`
        e.currentTarget.style.boxShadow = `0 0 20px ${accent}12, 0 8px 24px rgba(0,0,0,0.4)`
        e.currentTarget.style.transform = isActive ? 'translateY(-2px)' : 'none'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${accent}25`
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Top gradient bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${accent}, ${accent}66)`,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: '80px', height: '80px',
        borderRadius: '50%', background: accent, opacity: 0.06, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#eeeeff', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {subscription.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Badge variant={isActive ? 'positive' : 'default'}>
              {isActive ? 'Activa' : 'Pausada'}
            </Badge>
            {subscription.category && (
              <Badge variant="purple">{subscription.category.name}</Badge>
            )}
            {subscription.account && (
              <span style={{ fontSize: '11px', color: '#55556a' }}>
                · {subscription.account.name}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          {[{ icon: <Pencil size={13} />, action: () => onEdit(subscription) },
            { icon: <Trash2 size={13} />, action: () => onDelete(subscription), danger: true }
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              style={{ padding: '6px', borderRadius: '7px', border: 'none', background: 'transparent', color: '#55556a', cursor: 'pointer', transition: 'all 150ms' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = btn.danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.07)'
                e.currentTarget.style.color = btn.danger ? '#f87171' : '#c8c8e8'
              }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#55556a' }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#eeeeff', letterSpacing: '-0.02em' }}>
            {formatCurrency(subscription.amount, subscription.currency)}
          </span>
          <span style={{ fontSize: '12px', color: '#55556a', marginLeft: '5px' }}>
            / {FREQUENCY_LABELS[subscription.frequency] || 'periodo'}
          </span>
        </div>
        {subscription.frequency !== 'monthly' && (
          <span style={{ fontSize: '11.5px', color: '#7070a0' }}>
            ≈ {formatCurrency(monthlyEquivalent, subscription.currency)}/mes
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px',
        flexWrap: 'wrap', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {(isUrgent || isPastDue)
            ? <AlertTriangle size={13} color={accent} />
            : <Calendar size={13} color="#55556a" />
          }
          <span style={{
            fontSize: '12px', fontWeight: isUrgent || isPastDue ? 600 : 400,
            color: isPastDue ? '#f87171' : isUrgent ? '#fbbf24' : '#7070a0',
          }}>
            {dueDateText}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(subscription.id, subscription.is_active)}
            title={isActive ? 'Pausar' : 'Activar'}
          >
            {isActive ? <Pause size={13} /> : <Play size={13} />}
          </Button>
          {isActive && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCircle2 size={13} color="#4ade80" />}
              onClick={() => onRegisterPayment(subscription)}
            >
              Pagar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
