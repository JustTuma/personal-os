'use client'

import { Badge } from '@/components/ui/Badge'
import { Pencil, Trash2, Calendar, CheckSquare, CheckCircle2 } from 'lucide-react'
import type { ProjectWithStats } from '@/hooks/useProjects'
import type { ProjectStatus, Priority } from '@/types'
import { differenceInDays, parseISO } from 'date-fns'

interface ProjectCardProps {
  project: ProjectWithStats
  onEdit: (project: ProjectWithStats) => void
  onDelete: (project: ProjectWithStats) => void
  onSelect?: (project: ProjectWithStats) => void
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; variant: 'default' | 'positive' | 'warning' | 'purple' | 'info' }> = {
  idea:        { label: 'Idea',          variant: 'default' },
  planning:    { label: 'Planificación', variant: 'info' },
  in_progress: { label: 'En progreso',   variant: 'purple' },
  paused:      { label: 'Pausado',       variant: 'warning' },
  completed:   { label: 'Completado',    variant: 'positive' },
  cancelled:   { label: 'Cancelado',     variant: 'default' },
}

const PRIORITY_CONFIG: Record<Priority, { label: string; variant: 'default' | 'positive' | 'warning' | 'negative' | 'info' }> = {
  urgent: { label: 'Urgente', variant: 'negative' },
  high:   { label: 'Alta',    variant: 'warning' },
  medium: { label: 'Media',   variant: 'info' },
  low:    { label: 'Baja',    variant: 'default' },
}

export function ProjectCard({ project, onEdit, onDelete, onSelect }: ProjectCardProps) {
  const isCompleted = project.status === 'completed' || (project.totalTasks > 0 && project.completionRate === 100)
  const accent = isCompleted ? '#22c55e' : project.color || '#7c3aed'

  let daysLeft = null
  let daysUrgent = false
  if (project.target_date) {
    const days = differenceInDays(parseISO(project.target_date), new Date())
    daysUrgent = days >= 0 && days <= 5 && !isCompleted
    if (days < 0) daysLeft = 'Fecha superada'
    else if (days === 0) daysLeft = 'Entrega hoy'
    else daysLeft = `${days}d`
  }

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '20px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${accent}22`,
        transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
        cursor: onSelect ? 'pointer' : 'default',
      }}
      onClick={() => onSelect?.(project)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${accent}45`
        e.currentTarget.style.boxShadow = `0 0 22px ${accent}15, 0 8px 24px rgba(0,0,0,0.4)`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${accent}22`
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

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: '80px', height: '80px',
        borderRadius: '50%', background: accent, opacity: 0.06, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#eeeeff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.name}
            </h3>
            {isCompleted && <CheckCircle2 size={15} color="#4ade80" />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Badge variant={STATUS_CONFIG[project.status]?.variant || 'default'}>
              {STATUS_CONFIG[project.status]?.label || project.status}
            </Badge>
            <Badge variant={PRIORITY_CONFIG[project.priority]?.variant || 'default'}>
              {PRIORITY_CONFIG[project.priority]?.label || project.priority}
            </Badge>
            {daysLeft && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                fontSize: '11px', fontWeight: 600,
                color: daysUrgent ? '#fbbf24' : '#55556a',
              }}>
                <Calendar size={10} />
                {daysLeft}
              </span>
            )}
          </div>
          {project.description && (
            <p style={{ fontSize: '12px', color: '#7070a0', margin: '8px 0 0', lineHeight: 1.4 }}>
              {project.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          {[{ icon: <Pencil size={13} />, action: (e: React.MouseEvent) => { e.stopPropagation(); onEdit(project) } },
            { icon: <Trash2 size={13} />, action: (e: React.MouseEvent) => { e.stopPropagation(); onDelete(project) }, danger: true }
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

      {/* Progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#7070a0' }}>
            <CheckSquare size={12} color={accent} />
            {project.completedTasks} / {project.totalTasks} tareas
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: accent }}>
            {project.completionRate}%
          </span>
        </div>

        <div className="progress-track">
          <div style={{
            width: `${project.completionRate}%`, height: '100%', borderRadius: '999px',
            background: isCompleted
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : `linear-gradient(90deg, ${accent}, ${accent}cc)`,
            transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)',
            boxShadow: `0 0 6px ${accent}40`,
          }} />
        </div>
      </div>
    </div>
  )
}
