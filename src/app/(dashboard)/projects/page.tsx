'use client'

import { useState, useMemo } from 'react'
import { useProjects, type ProjectWithStats } from '@/hooks/useProjects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FolderOpen, Plus } from 'lucide-react'
import type { ProjectFormValues } from '@/lib/validations/project'

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<ProjectWithStats | null>(null)
  const [deleting, setDeleting] = useState<ProjectWithStats | null>(null)
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'planning' | 'completed'>('in_progress')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculations for summary stats
  const stats = useMemo(() => {
    const total = projects.length
    const inProgress = projects.filter(p => p.status === 'in_progress').length
    const completed = projects.filter(p => p.status === 'completed').length
    const totalTasks = projects.reduce((acc, p) => acc + p.totalTasks, 0)
    const completedTasks = projects.reduce((acc, p) => acc + p.completedTasks, 0)

    return { total, inProgress, completed, totalTasks, completedTasks }
  }, [projects])

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (filter === 'in_progress') return projects.filter(p => p.status === 'in_progress')
    if (filter === 'planning') return projects.filter(p => p.status === 'planning' || p.status === 'idea')
    if (filter === 'completed') return projects.filter(p => p.status === 'completed')
    return projects
  }, [projects, filter])

  async function handleCreate(values: ProjectFormValues) {
    setIsSubmitting(true)
    try {
      await createProject(values)
      setShowCreate(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(values: ProjectFormValues) {
    if (!editing) return
    setIsSubmitting(true)
    try {
      await updateProject(editing.id, values)
      setEditing(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await deleteProject(deleting.id)
      setDeleting(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
            Proyectos
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            Gestión de iniciativas, estados y entregas
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nuevo proyecto
        </Button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            En progreso
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#f2f2f8', margin: 0, letterSpacing: '-0.02em' }}>
            {stats.inProgress} <span style={{ fontSize: '14px', fontWeight: 400, color: '#646473' }}>/ {stats.total} proyectos</span>
          </p>
          <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
            Iniciativas activas
          </p>
        </div>

        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            Tareas asociadas
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#818cf8', margin: 0, letterSpacing: '-0.02em' }}>
            {stats.completedTasks} <span style={{ fontSize: '14px', fontWeight: 400, color: '#646473' }}>/ {stats.totalTasks} hechas</span>
          </p>
          <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
            Progreso general de tareas
          </p>
        </div>

        <div style={{ backgroundColor: '#111117', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            Proyectos completados
          </p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#4ade80', margin: 0, letterSpacing: '-0.02em' }}>
            {stats.completed}
          </p>
          <p style={{ fontSize: '12px', color: '#646473', margin: '4px 0 0' }}>
            Metas e iniciativas finalizadas
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      {projects.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
          {(['in_progress', 'all', 'planning', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === tab ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: filter === tab ? '#818cf8' : '#a0a0b0',
                fontSize: '13px',
                fontWeight: filter === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 120ms',
              }}
            >
              {tab === 'in_progress' && `En progreso (${stats.inProgress})`}
              {tab === 'all' && `Todos (${projects.length})`}
              {tab === 'planning' && `Planificación (${projects.filter(p => p.status === 'planning' || p.status === 'idea').length})`}
              {tab === 'completed' && `Completados (${stats.completed})`}
            </button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <EmptyState
            icon={FolderOpen}
            title={filter === 'in_progress' ? 'No tenés proyectos en progreso' : 'No hay proyectos en esta vista'}
            description={filter === 'in_progress' ? 'Creá tu primer proyecto para agrupar tareas, notas y seguir su avance.' : ''}
            actionLabel={filter === 'in_progress' ? 'Crear proyecto' : undefined}
            onAction={filter === 'in_progress' ? () => setShowCreate(true) : undefined}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo proyecto">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar proyecto">
        {editing && (
          <ProjectForm
            defaultValues={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar proyecto"
        description={`¿Querés eliminar el proyecto "${deleting?.name}"? Las tareas asociadas seguirán existiendo sin proyecto.`}
      />
    </div>
  )
}
