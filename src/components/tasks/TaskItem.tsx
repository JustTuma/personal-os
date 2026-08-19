'use client'

import { Badge } from '@/components/ui/Badge'
import { Check, Calendar, Pencil, Trash2, Folder } from 'lucide-react'
import type { TaskWithRelations, Priority } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

interface TaskItemProps {
  task: TaskWithRelations
  onToggle: (task: TaskWithRelations) => void
  onEdit: (task: TaskWithRelations) => void
  onDelete: (task: TaskWithRelations) => void
}

const PRIORITY_COLORS: Record<Priority, { dot: string; bg: string }> = {
  urgent: { dot: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  high:   { dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  medium: { dot: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  low:    { dot: '#55556a', bg: 'rgba(255,255,255,0.04)' },
}

const PRIORITY_CONFIG: Record<Priority, { label: string; variant: 'default' | 'positive' | 'warning' | 'negative' | 'info' }> = {
  urgent: { label: 'Urgente', variant: 'negative' },
  high:   { label: 'Alta',    variant: 'warning' },
  medium: { label: 'Media',   variant: 'info' },
  low:    { label: 'Baja',    variant: 'default' },
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed'
  const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium

  let daysUntil = null
  let isOverdue = false
  let isDueSoon = false

  if (task.due_date && !isCompleted) {
    const diff = differenceInDays(parseISO(task.due_date), new Date())
    daysUntil = diff
    isOverdue = diff < 0
    isDueSoon = diff >= 0 && diff <= 2
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 16px',
        background: isCompleted ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isCompleted ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: isCompleted ? '1px solid rgba(255,255,255,0.04)' : `3px solid ${priorityStyle.dot}`,
        borderRadius: '12px',
        transition: 'all 150ms',
        opacity: isCompleted ? 0.5 : 1,
      }}
      onMouseEnter={e => {
        if (!isCompleted) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.borderLeftColor = priorityStyle.dot
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isCompleted ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)'
        e.currentTarget.style.borderColor = isCompleted ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'
        if (!isCompleted) e.currentTarget.style.borderLeftColor = priorityStyle.dot
      }}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(task)}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '6px',
          border: isCompleted ? 'none' : `1.5px solid rgba(255,255,255,0.2)`,
          backgroundColor: isCompleted ? '#22c55e' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 180ms',
          boxShadow: isCompleted ? '0 0 8px rgba(34,197,94,0.4)' : 'none',
        }}
        onMouseEnter={e => {
          if (!isCompleted) {
            e.currentTarget.style.borderColor = '#34d399'
            e.currentTarget.style.background = 'rgba(52,211,153,0.1)'
          }
        }}
        onMouseLeave={e => {
          if (!isCompleted) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        {isCompleted && <Check size={12} color="white" strokeWidth={3} />}
      </button>

      {/* Main Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13.5px',
          fontWeight: isCompleted ? 400 : 500,
          color: isCompleted ? '#55556a' : '#eeeeff',
          textDecoration: isCompleted ? 'line-through' : 'none',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {task.title}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '4px', flexWrap: 'wrap' }}>
          {!isCompleted && (
            <Badge variant={PRIORITY_CONFIG[task.priority]?.variant || 'default'} size="sm">
              {PRIORITY_CONFIG[task.priority]?.label || task.priority}
            </Badge>
          )}

          {task.project && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              fontSize: '11px', color: task.project.color || '#7070a0',
              background: 'rgba(255,255,255,0.04)',
              padding: '2px 6px', borderRadius: '5px',
            }}>
              <Folder size={10} />
              {task.project.name}
            </span>
          )}

          {task.due_date && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              fontSize: '11px', fontWeight: isOverdue || isDueSoon ? 600 : 400,
              color: isOverdue ? '#f87171' : isDueSoon ? '#fbbf24' : '#55556a',
            }}>
              <Calendar size={10} />
              {isOverdue
                ? `Venció ${task.due_date}`
                : daysUntil === 0
                ? 'Hoy'
                : daysUntil === 1
                ? 'Mañana'
                : task.due_date}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons (visible on hover via group) */}
      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(task)}
          title="Editar"
          style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#55556a', cursor: 'pointer', transition: 'all 150ms' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#c8c8e8' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#55556a' }}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(task)}
          title="Eliminar"
          style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#55556a', cursor: 'pointer', transition: 'all 150ms' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#55556a' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
