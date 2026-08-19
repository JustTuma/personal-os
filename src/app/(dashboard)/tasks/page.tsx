'use client'

import { useState, useMemo } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { TaskItem } from '@/components/tasks/TaskItem'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CheckSquare, Plus, Search, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import type { TaskWithRelations } from '@/types'
import type { TaskFormValues } from '@/lib/validations/task'

export default function TasksPage() {
  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleTask } = useTasks()
  const { projects } = useProjects()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<TaskWithRelations | null>(null)
  const [deleting, setDeleting] = useState<TaskWithRelations | null>(null)
  const [filter, setFilter] = useState<'all' | 'todo' | 'completed'>('todo')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [quickTitle, setQuickTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = total - completed
    const urgent = tasks.filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length
    return { total, completed, pending, urgent }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filter === 'todo' && t.status === 'completed') return false
      if (filter === 'completed' && t.status !== 'completed') return false
      if (selectedProject !== 'all' && t.project_id !== selectedProject) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, filter, selectedProject, search])

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!quickTitle.trim()) return
    setIsSubmitting(true)
    try {
      await createTask({
        title: quickTitle.trim(),
        priority: 'medium',
        status: 'todo',
        project_id: selectedProject !== 'all' ? selectedProject : null,
      })
      setQuickTitle('')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateModal(values: TaskFormValues) {
    setIsSubmitting(true)
    try { await createTask(values); setShowCreate(false) }
    finally { setIsSubmitting(false) }
  }

  async function handleUpdate(values: TaskFormValues) {
    if (!editing) return
    setIsSubmitting(true)
    try { await updateTask(editing.id, values); setEditing(null) }
    finally { setIsSubmitting(false) }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try { await deleteTask(deleting.id); setDeleting(null) }
    finally { setIsDeleting(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px',
            backgroundColor: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
            marginBottom: '10px',
          }}>
            <CheckSquare size={11} color="#34d399" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#34d399', letterSpacing: '0.04em' }}>Productividad</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>Tareas</h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0' }}>
            {stats.pending} pendientes · {stats.completed} completadas
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nueva tarea
        </Button>
      </div>

      {/* KPI Mini Stats */}
      <div className="grid grid-cols-3 gap-3 stagger animate-slide-up">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#a78bfa" />
            </div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>{stats.pending}</p>
              <p style={{ fontSize: '11px', color: '#55556a', margin: 0, fontWeight: 500 }}>Pendientes</p>
            </div>
          </div>
        </div>
        <div className="stat-card stat-card-positive">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#10b981" />
            </div>
            <div>
              <p className="gradient-text-green" style={{ fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>{stats.completed}</p>
              <p style={{ fontSize: '11px', color: '#55556a', margin: 0, fontWeight: 500 }}>Completadas</p>
            </div>
          </div>
        </div>
        <div className={`stat-card ${stats.urgent > 0 ? 'stat-card-negative' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: stats.urgent > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color={stats.urgent > 0 ? '#ef4444' : '#55556a'} />
            </div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: stats.urgent > 0 ? '#f87171' : '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>{stats.urgent}</p>
              <p style={{ fontSize: '11px', color: '#55556a', margin: 0, fontWeight: 500 }}>Urgentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <form onSubmit={handleQuickAdd} className="glass-card animate-fade-in" style={{ display: 'flex', gap: '10px', padding: '10px 14px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
          backgroundColor: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          alignSelf: 'center',
        }}>
          <Plus size={15} color="#34d399" />
        </div>
        <input
          type="text"
          placeholder="Escribí una tarea y presioná Enter..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          style={{
            flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none',
            fontSize: '14px', color: '#eeeeff', padding: '4px 0',
          }}
        />
        <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!quickTitle.trim()}>
          Agregar
        </Button>
      </form>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div className="filter-tabs" style={{ border: 'none', paddingBottom: 0 }}>
          {(['todo', 'all', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`filter-tab ${filter === tab ? 'filter-tab-active' : ''}`}
            >
              {tab === 'todo' && `Pendientes (${stats.pending})`}
              {tab === 'all' && `Todas (${stats.total})`}
              {tab === 'completed' && `Completadas (${stats.completed})`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{
                height: '34px', padding: '0 12px', borderRadius: '999px',
                backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-medium)',
                color: '#9898b8', fontSize: '12.5px', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="all">Todos los proyectos</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '180px', height: '34px', paddingLeft: '32px', paddingRight: '12px',
                borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-medium)', color: '#eeeeff', fontSize: '12.5px', outline: 'none',
              }}
            />
            <Search size={13} color="#55556a" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <EmptyState
            icon={CheckSquare}
            title={filter === 'todo' ? 'No tenés tareas pendientes' : 'No hay tareas en esta vista'}
            description={filter === 'todo' ? '¡Buen trabajo! O agregá una nueva tarea arriba para empezar.' : ''}
            actionLabel={filter === 'todo' ? 'Crear tarea completa' : undefined}
            onAction={filter === 'todo' ? () => setShowCreate(true) : undefined}
          />
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredTasks.map((task, i) => (
            <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              <TaskItem task={task} onToggle={toggleTask} onEdit={setEditing} onDelete={setDeleting} />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva tarea">
        <TaskForm onSubmit={handleCreateModal} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar tarea">
        {editing && <TaskForm defaultValues={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} isLoading={isSubmitting} />}
      </Modal>
      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Eliminar tarea" description={`¿Querés eliminar "${deleting?.title}"?`} />
    </div>
  )
}
