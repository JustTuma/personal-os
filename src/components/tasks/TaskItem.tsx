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

const PRIORITY_CONFIG: Record<Priority, { label: string; variant: 'default' | 'positive' | 'warning' | 'negative' | 'info' }> = {
  urgent: { label: 'Urgente', variant: 'negative' },
  high:   { label: 'Alta',    variant: 'warning' },
  medium: { label: 'Media',   variant: 'info' },
  low:    { label: 'Baja',    variant: 'default' },
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const isCompleted = task.status === 'completed'

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
        padding: '12px 18px',
        backgroundColor: '#111117',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        transition: 'all 120ms',
        opacity: isCompleted ? 0.55 : 1,
      }}
    >
      {/* Custom Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(task)}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '6px',
          border: isCompleted ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.25)',
          backgroundColor: isCompleted ? '#22c55e' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 120ms',
        }}
      >
        {isCompleted && <Check size={13} color="white" strokeWidth={3} />}
      </button>

      {/* Main Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '14px',
          fontWeight: 500,
          color: isCompleted ? '#707082' : '#f2f2f8',
          textDecoration: isCompleted ? 'line-through' : 'none',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {task.title}
        </p>

        {task.description && !isCompleted && (
          <p style={{ fontSize: '12px', color: '#646473', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          <Badge variant={PRIORITY_CONFIG[task.priority]?.variant || 'default'} size="sm">
            {PRIORITY_CONFIG[task.priority]?.label || task.priority}
          </Badge>

          {task.project && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: task.project.color || '#a0a0b0',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              <Folder size={11} />
              {task.project.name}
            </span>
          )}

          {task.due_date && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              color: isOverdue ? '#f87171' : isDueSoon ? '#fbbf24' : '#646473',
              fontWeight: isOverdue || isDueSoon ? 600 : 400,
            }}>
              <Calendar size={11} />
              {isOverdue
                ? `Venció el ${task.due_date}`
                : daysUntil === 0
                ? 'Vence hoy'
                : daysUntil === 1
                ? 'Vence mañana'
                : task.due_date}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(task)}
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
          onClick={() => onDelete(task)}
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
  )
}
