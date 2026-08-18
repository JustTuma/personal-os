'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { formatDateRelative } from '@/lib/utils/date'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pencil, Trash2, CheckCircle2, Pause, Play, Calendar } from 'lucide-react'
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
  custom:  'Personalizado',
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggleActive,
  onRegisterPayment,
}: SubscriptionCardProps) {
  const daysUntil = differenceInDays(parseISO(subscription.next_payment_date), new Date())

  // Calculate monthly equivalent
  let monthlyEquivalent = subscription.amount
  if (subscription.frequency === 'annual') monthlyEquivalent = subscription.amount / 12
  if (subscription.frequency === 'weekly') monthlyEquivalent = subscription.amount * 4.33
  if (subscription.frequency === 'custom' && subscription.custom_days) {
    monthlyEquivalent = (subscription.amount / subscription.custom_days) * 30
  }

  const isUrgent = daysUntil >= 0 && daysUntil <= 3
  const isPastDue = daysUntil < 0

  return (
    <div style={{
      backgroundColor: '#111117',
      border: `1px solid ${isUrgent && subscription.is_active ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px',
      opacity: subscription.is_active ? 1 : 0.6,
      transition: 'all 150ms',
    }}>
      {/* Top row: Name & Badges */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: '0 0 4px' }}>
              {subscription.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Badge variant={subscription.is_active ? 'positive' : 'default'}>
                {subscription.is_active ? 'Activa' : 'Pausada'}
              </Badge>
              {subscription.category && (
                <Badge variant="purple">{subscription.category.name}</Badge>
              )}
              {subscription.account && (
                <span style={{ fontSize: '11px', color: '#a0a0b0' }}>
                  💳 {subscription.account.name}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => onEdit(subscription)}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#646473',
                cursor: 'pointer',
              }}
              title="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(subscription)}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#646473',
                cursor: 'pointer',
              }}
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {subscription.notes && (
          <p style={{ fontSize: '12px', color: '#646473', margin: '8px 0 0', lineHeight: 1.4 }}>
            {subscription.notes}
          </p>
        )}
      </div>

      {/* Middle row: Price & Frequency */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '12px 14px',
        backgroundColor: '#181820',
        borderRadius: '10px',
      }}>
        <div>
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#f2f2f8' }}>
            {formatCurrency(subscription.amount, subscription.currency)}
          </span>
          <span style={{ fontSize: '12px', color: '#646473', marginLeft: '6px' }}>
            / {FREQUENCY_LABELS[subscription.frequency] || 'periodo'}
          </span>
        </div>

        {subscription.frequency !== 'monthly' && (
          <span style={{ fontSize: '11.5px', color: '#a0a0b0' }}>
            ≈ {formatCurrency(monthlyEquivalent, subscription.currency)}/mes
          </span>
        )}
      </div>

      {/* Bottom row: Next Payment & Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        paddingTop: '12px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color={isUrgent ? '#fbbf24' : isPastDue ? '#f87171' : '#646473'} />
          <span style={{
            fontSize: '12px',
            color: isUrgent ? '#fbbf24' : isPastDue ? '#f87171' : '#a0a0b0',
            fontWeight: isUrgent || isPastDue ? 600 : 400,
          }}>
            {isPastDue
              ? `Venció el ${subscription.next_payment_date}`
              : daysUntil === 0
              ? 'Vence hoy'
              : daysUntil === 1
              ? 'Vence mañana'
              : `Vence en ${daysUntil} días (${subscription.next_payment_date})`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(subscription.id, subscription.is_active)}
            title={subscription.is_active ? 'Pausar' : 'Activar'}
          >
            {subscription.is_active ? <Pause size={14} /> : <Play size={14} />}
          </Button>
          {subscription.is_active && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCircle2 size={14} color="#4ade80" />}
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
