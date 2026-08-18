'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Pencil, Trash2, Plus, Calendar, Target, CheckCircle2, History, ChevronRight } from 'lucide-react'
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
  paused:    { label: 'Pausado',      variant: 'default' },
  cancelled: { label: 'Cancelado',    variant: 'warning' },
}

export function GoalCard({ goal, onEdit, onDelete, onContribute }: GoalCardProps) {
  const [showHistory, setShowHistory] = useState(false)

  const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
  const remaining = Math.max(0, goal.target_amount - goal.current_amount)
  const isCompleted = goal.current_amount >= goal.target_amount || goal.status === 'completed'

  let daysLeftText = null
  if (goal.target_date) {
    const days = differenceInDays(parseISO(goal.target_date), new Date())
    if (days < 0) daysLeftText = 'Fecha meta superada'
    else if (days === 0) daysLeftText = 'Meta para hoy'
    else daysLeftText = `Faltan ${days} días (${goal.target_date})`
  }

  return (
    <>
      <div style={{
        backgroundColor: '#111117',
        border: `1px solid ${isCompleted ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: '14px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all 150ms',
      }}>
        {/* Top color accent strip */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: isCompleted ? '#22c55e' : goal.color || '#6366f1',
        }} />

        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
                  {goal.name}
                </h3>
                {isCompleted && <CheckCircle2 size={16} color="#4ade80" />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <Badge variant={STATUS_CONFIG[goal.status]?.variant || 'default'}>
                  {STATUS_CONFIG[goal.status]?.label || goal.status}
                </Badge>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase' }}>
                  {goal.currency}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => onEdit(goal)}
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
                onClick={() => onDelete(goal)}
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

          {goal.description && (
            <p style={{ fontSize: '12.5px', color: '#a0a0b0', margin: '8px 0 0', lineHeight: 1.4 }}>
              {goal.description}
            </p>
          )}
        </div>

        {/* Amount & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '22px', fontWeight: 600, color: '#f2f2f8' }}>
                {formatCurrency(goal.current_amount, goal.currency)}
              </span>
              <span style={{ fontSize: '13px', color: '#646473', marginLeft: '6px' }}>
                de {formatCurrency(goal.target_amount, goal.currency)}
              </span>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: isCompleted ? '#4ade80' : goal.color || '#818cf8',
            }}>
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '8px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: '999px',
              backgroundColor: isCompleted ? '#22c55e' : goal.color || '#6366f1',
              transition: 'width 400ms ease-out',
            }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#646473' }}>
            <span>
              {remaining > 0 ? `Faltan ${formatCurrency(remaining, goal.currency)}` : '¡Meta alcanzada!'}
            </span>
            {daysLeftText && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#a0a0b0' }}>
                <Calendar size={12} />
                {daysLeftText}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '12px',
          gap: '8px',
        }}>
          <button
            onClick={() => setShowHistory(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#a0a0b0',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <History size={13} />
            <span>{goal.contributions.length} aportes</span>
          </button>

          {!isCompleted && (
            <Button
              size="sm"
              leftIcon={<Plus size={14} color="white" />}
              onClick={() => onContribute(goal)}
            >
              Sumar aporte
            </Button>
          )}
        </div>
      </div>

      {/* Contributions History Modal */}
      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title={`Historial de aportes: ${goal.name}`}
        description={`Total acumulado: ${formatCurrency(goal.current_amount, goal.currency)}`}
        size="sm"
      >
        {goal.contributions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#646473', padding: '24px 0', fontSize: '13px' }}>
            No hay aportes registrados aún.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {goal.contributions.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#111117',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#f2f2f8', margin: 0 }}>
                    +{formatCurrency(c.amount, goal.currency)}
                  </p>
                  <p style={{ fontSize: '11.5px', color: '#646473', margin: '2px 0 0' }}>
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
