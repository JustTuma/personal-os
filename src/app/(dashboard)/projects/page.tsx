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
import { FolderOpen, Plus, CheckCircle2, Layers, Zap } from 'lucide-react'
import type { ProjectFormValues } from '@/lib/validations/project'

export default function ProjectsPage() {
  const { projects, isLoading, createProject, updateProject, deleteProject } = useProjects()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<ProjectWithStats | null>(null)
  const [deleting, setDeleting] = useState<ProjectWithStats | null>(null)
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'planning' | 'completed'>('in_progress')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const stats = useMemo(() => {
    const total = projects.length
    const inProgress = projects.filter(p => p.status === 'in_progress').length
    const completed = projects.filter(p => p.status === 'completed').length
    const totalTasks = projects.reduce((acc, p) => acc + p.totalTasks, 0)
    const completedTasks = projects.reduce((acc, p) => acc + p.completedTasks, 0)
    return { total, inProgress, completed, totalTasks, completedTasks }
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (filter === 'in_progress') return projects.filter(p => p.status === 'in_progress')
    if (filter === 'planning') return projects.filter(p => p.status === 'planning' || p.status === 'idea')
    if (filter === 'completed') return projects.filter(p => p.status === 'completed')
    return projects
  }, [projects, filter])

  async function handleCreate(values: ProjectFormValues) {
    setIsSubmitting(true)
    try { await createProject(values); setShowCreate(false) }
    finally { setIsSubmitting(false) }
  }

  async function handleUpdate(values: ProjectFormValues) {
    if (!editing) return
    setIsSubmitting(true)
    try { await updateProject(editing.id, values); setEditing(null) }
    finally { setIsSubmitting(false) }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try { await deleteProject(deleting.id); setDeleting(null) }
    finally { setIsDeleting(false) }
  }

  const overallProgress = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px',
            backgroundColor: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)',
            marginBottom: '10px',
          }}>
            <FolderOpen size={11} color="#fb923c" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#fb923c', letterSpacing: '0.04em' }}>Iniciativas</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>Proyectos</h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0' }}>Gestión de iniciativas, estados y entregas</p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nuevo proyecto
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger animate-slide-up">
        <div className="stat-card stat-card-accent">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>En progreso</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#7c3aed" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <p className="gradient-text" style={{ fontSize: '36px', fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>{stats.inProgress}</p>
            <span style={{ fontSize: '13px', color: '#55556a' }}>/ {stats.total} proyectos</span>
          </div>
          <p style={{ fontSize: '11.5px', color: '#55556a', margin: '6px 0 0' }}>Iniciativas activas</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Tareas asociadas</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={14} color="#60a5fa" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#60a5fa', margin: 0, letterSpacing: '-0.04em' }}>{stats.completedTasks}</p>
            <span style={{ fontSize: '13px', color: '#55556a' }}>/ {stats.totalTasks}</span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#55556a', marginBottom: '5px' }}>
              <span>Progreso general</span>
              <span style={{ fontWeight: 600, color: '#60a5fa' }}>{overallProgress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${overallProgress}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-positive">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Completados</p>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={14} color="#10b981" />
            </div>
          </div>
          <p className="gradient-text-green" style={{ fontSize: '36px', fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>
            {stats.completed}
          </p>
          <p style={{ fontSize: '11.5px', color: '#55556a', margin: '6px 0 0' }}>Iniciativas finalizadas</p>
        </div>
      </div>

      {/* Filter Tabs */}
      {projects.length > 0 && (
        <div className="filter-tabs animate-fade-in">
          {(['in_progress', 'all', 'planning', 'completed'] as const).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} className={`filter-tab ${filter === tab ? 'filter-tab-active' : ''}`}>
              {tab === 'in_progress' && `En progreso (${stats.inProgress})`}
              {tab === 'all' && `Todos (${projects.length})`}
              {tab === 'planning' && `Planificación (${projects.filter(p => p.status === 'planning' || p.status === 'idea').length})`}
              {tab === 'completed' && `Completados (${stats.completed})`}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <EmptyState
            icon={FolderOpen}
            title={filter === 'in_progress' ? 'No tenés proyectos en progreso' : 'No hay proyectos en esta vista'}
            description={filter === 'in_progress' ? 'Creá tu primer proyecto para agrupar tareas, notas y seguir su avance.' : ''}
            actionLabel={filter === 'in_progress' ? 'Crear proyecto' : undefined}
            onAction={filter === 'in_progress' ? () => setShowCreate(true) : undefined}
          />
        </div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredProjects.map((project, i) => (
            <div key={project.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ProjectCard project={project} onEdit={setEditing} onDelete={setDeleting} />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo proyecto">
        <ProjectForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar proyecto">
        {editing && <ProjectForm defaultValues={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} isLoading={isSubmitting} />}
      </Modal>
      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Eliminar proyecto" description={`¿Querés eliminar el proyecto "${deleting?.name}"? Las tareas asociadas seguirán existiendo sin proyecto.`} />
    </div>
  )
}
