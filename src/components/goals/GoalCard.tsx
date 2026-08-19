'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Pencil, Trash2, Plus, Calendar, CheckCircle2, History } from 'lucide-react'
import type { GoalWithContributions } from '@/hooks/useFinancialGoals'
import { differenceInDays, parseISO } from 'date-fns'

interface GoalCardProps {
  goal: GoalWithContributions
  onEdit: (goal: GoalWithContributions) => void
  onDelete: (goal: GoalWithContributions) => void
  onContribute: (goal: GoalWithContributions) => void
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'positive' | 'warning' | 'purple' }> = {
  active:    { label: 'En progreso', variant: 'purple' },
  completed: { label: 'Completado',  variant: 'positive' },
  paused:    { label: 'Pausado',     variant: 'default' },
  cancelled: { label: 'Cancelado',   variant: 'warning' },
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const [showHistory, setShowHistory] = useState(false)

  const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
  const remaining = Math.max(0, goal.target_amount - goal.current_amount)
  const isCompleted = goal.current_amount >= goal.target_amount || goal.status === 'completed'
  const accent = isCompleted ? '#22c55e' : goal.color || '#7c3aed'

  let daysLeftText = null
  let isUrgent = false
  if (goal.target_date) {
    const days = differenceInDays(parseISO(goal.target_date), new Date())
    isUrgent = days >= 0 && days <= 7 && !isCompleted
    if (days < 0) daysLeftText = 'Fecha meta superada'
    else if (days === 0) daysLeftText = 'Meta para hoy'
    else daysLeftText = `${days}d`
  }

  return (
    <>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          borderRadius: '16px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.25)' : `${accent}22`}`,
          transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = `${accent}45`
          e.currentTarget.style.boxShadow = `0 0 22px ${accent}15, 0 8px 24px rgba(0,0,0,0.4)`
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = isCompleted ? 'rgba(34,197,94,0.25)' : `${accent}22`
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Top gradient bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: isCompleted
            ? 'linear-gradient(90deg, #22c55e, #4ade80)'
            : `linear-gradient(90deg, ${accent}, ${accent}88)`,
        }} />

        {/* Ambient corner glow */}
        <div style={{
          position: 'absolute', top: -24, right: -24, width: '90px', height: '90px',
          borderRadius: '50%', background: accent, opacity: 0.06, filter: 'blur(22px)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#eeeeff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {goal.name}
              </h3>
              {isCompleted && <CheckCircle2 size={15} color="#4ade80" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <Badge variant={STATUS_CONFIG[goal.status]?.variant || 'default'}>
                {STATUS_CONFIG[goal.status]?.label || goal.status}
              </Badge>
              <span style={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {goal.currency}
              </span>
              {daysLeftText && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  fontSize: '11px', fontWeight: 600,
                  color: isUrgent ? '#fbbf24' : '#55556a',
                }}>
                  <Calendar size={10} />
                  {daysLeftText}
                </span>
              )}
            </div>
            {goal.description && (
              <p style={{ fontSize: '12px', color: '#7070a0', margin: '6px 0 0', lineHeight: 1.4 }}>
                {goal.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            {[{ icon: <Pencil size={13} />, action: () => onEdit(goal), hover: '#c8c8e8' },
              { icon: <Trash2 size={13} />, action: () => onDelete(goal), hover: '#f87171', hoverBg: 'rgba(239,68,68,0.1)' }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                style={{ padding: '6px', borderRadius: '7px', border: 'none', background: 'transparent', color: '#55556a', cursor: 'pointer', transition: 'all 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = btn.hoverBg || 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = btn.hover }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#55556a' }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#eeeeff', letterSpacing: '-0.02em' }}>
                {formatCurrency(goal.current_amount, goal.currency)}
              </span>
              <span style={{ fontSize: '12.5px', color: '#55556a', marginLeft: '6px' }}>
                de {formatCurrency(goal.target_amount, goal.currency)}
              </span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: accent }}>
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="progress-track">
            <div style={{
              width: `${progress}%`, height: '100%', borderRadius: '999px',
              background: isCompleted
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : `linear-gradient(90deg, ${accent}, ${accent}cc)`,
              transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)',
              boxShadow: `0 0 8px ${accent}50`,
            }} />
          </div>

          <p style={{ fontSize: '11.5px', color: '#55556a', margin: 0 }}>
            {remaining > 0
              ? `Faltan ${formatCurrency(remaining, goal.currency)}`
              : '🎉 ¡Meta alcanzada!'}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', gap: '8px',
        }}>
          <button
            onClick={() => setShowHistory(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 8px', borderRadius: '7px', border: 'none',
              background: 'rgba(255,255,255,0.04)', color: '#7070a0',
              fontSize: '11.5px', cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#c8c8e8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#7070a0' }}
          >
            <History size={12} />
            <span>{goal.contributions.length} aportes</span>
          </button>

          {!isCompleted && (
            <Button size="sm" leftIcon={<Plus size={13} color="white" />} onClick={() => onContribute(goal)}>
              Sumar
            </Button>
          )}
        </div>
      </div>

      {/* Contributions History Modal */}
      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title={`Historial: ${goal.name}`}
        description={`Total acumulado: ${formatCurrency(goal.current_amount, goal.currency)}`}
        size="sm"
      >
        {goal.contributions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#55556a', padding: '24px 0', fontSize: '13px' }}>
            No hay aportes registrados aún.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {goal.contributions.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#34d399', margin: 0 }}>
                    +{formatCurrency(c.amount, goal.currency)}
                  </p>
                  <p style={{ fontSize: '11.5px', color: '#55556a', margin: '2px 0 0' }}>
                    {c.notes || 'Aporte'} · {c.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}
