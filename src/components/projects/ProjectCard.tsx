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

  let daysLeftText = null
  if (project.target_date) {
    const days = differenceInDays(parseISO(project.target_date), new Date())
    if (days < 0) daysLeftText = 'Fecha meta superada'
    else if (days === 0) daysLeftText = 'Entrega hoy'
    else daysLeftText = `Faltan ${days} días (${project.target_date})`
  }

  return (
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
      {/* Top color line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: isCompleted ? '#22c55e' : project.color || '#6366f1',
      }} />

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f2f2f8', margin: 0 }}>
                {project.name}
              </h3>
              {isCompleted && <CheckCircle2 size={16} color="#4ade80" />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              <Badge variant={STATUS_CONFIG[project.status]?.variant || 'default'}>
                {STATUS_CONFIG[project.status]?.label || project.status}
              </Badge>
              <Badge variant={PRIORITY_CONFIG[project.priority]?.variant || 'default'}>
                {PRIORITY_CONFIG[project.priority]?.label || project.priority}
              </Badge>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => onEdit(project)}
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
              onClick={() => onDelete(project)}
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

        {project.description && (
          <p style={{ fontSize: '12.5px', color: '#a0a0b0', margin: '10px 0 0', lineHeight: 1.4 }}>
            {project.description}
          </p>
        )}
      </div>

      {/* Progress & Task Counts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#a0a0b0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckSquare size={13} color="#818cf8" />
            {project.completedTasks} de {project.totalTasks} tareas completadas
          </span>
          <span style={{ fontWeight: 600, color: project.color || '#818cf8' }}>
            {project.completionRate}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '6px',
          borderRadius: '999px',
          backgroundColor: 'rgba(255, 255, 255, 0.07)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${project.completionRate}%`,
            height: '100%',
            borderRadius: '999px',
            backgroundColor: isCompleted ? '#22c55e' : project.color || '#6366f1',
            transition: 'width 400ms ease-out',
          }} />
        </div>
      </div>

      {/* Footer / Due Date */}
      {daysLeftText && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#a0a0b0',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '10px',
        }}>
          <Calendar size={13} color="#646473" />
          <span>{daysLeftText}</span>
        </div>
      )}
    </div>
  )
}
