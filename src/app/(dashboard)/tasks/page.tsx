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
import { CheckSquare, Plus, Search } from 'lucide-react'
import type { TaskWithRelations } from '@/types'
import type { TaskFormValues } from '@/lib/validations/task'

export default function TasksPage() {
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTasks()

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

  // Calculations for summary stats
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = total - completed
    const urgent = tasks.filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length

    return { total, completed, pending, urgent }
  }, [tasks])

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Status filter
      if (filter === 'todo' && t.status === 'completed') return false
      if (filter === 'completed' && t.status !== 'completed') return false

      // Project filter
      if (selectedProject !== 'all' && t.project_id !== selectedProject) return false

      // Search
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
    try {
      await createTask(values)
      setShowCreate(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(values: TaskFormValues) {
    if (!editing) return
    setIsSubmitting(true)
    try {
      await updateTask(editing.id, values)
      setEditing(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await deleteTask(deleting.id)
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
            Tareas
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            {stats.pending} pendientes · {stats.completed} completadas
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => setShowCreate(true)}>
          Nueva tarea
        </Button>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} style={{
        display: 'flex',
        gap: '10px',
        backgroundColor: '#111117',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '8px 12px',
      }}>
        <input
          type="text"
          placeholder="Escribí una tarea y presioná Enter..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: '#f2f2f8',
            padding: '4px 8px',
          }}
        />
        <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!quickTitle.trim()}>
          Agregar
        </Button>
      </form>

      {/* Filter & Search Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['todo', 'all', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === tab ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: filter === tab ? '#818cf8' : '#a0a0b0',
                fontSize: '13px',
                fontWeight: filter === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 120ms',
              }}
            >
              {tab === 'todo' && `Pendientes (${stats.pending})`}
              {tab === 'all' && `Todas (${stats.total})`}
              {tab === 'completed' && `Completadas (${stats.completed})`}
            </button>
          ))}
        </div>

        {/* Project Selector & Search */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{
                height: '34px',
                padding: '0 12px',
                borderRadius: '8px',
                backgroundColor: '#181820',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#a0a0b0',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          <div style={{ position: 'relative', width: '200px' }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                paddingLeft: '32px',
                paddingRight: '12px',
                borderRadius: '8px',
                backgroundColor: '#181820',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#f2f2f8',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <Search size={14} color="#646473" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <EmptyState
            icon={CheckSquare}
            title={filter === 'todo' ? 'No tenés tareas pendientes' : 'No hay tareas en esta vista'}
            description={filter === 'todo' ? '¡Buen trabajo! O agregá una nueva tarea arriba para empezar.' : ''}
            actionLabel={filter === 'todo' ? 'Crear tarea completa' : undefined}
            onAction={filter === 'todo' ? () => setShowCreate(true) : undefined}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva tarea">
        <TaskForm onSubmit={handleCreateModal} onCancel={() => setShowCreate(false)} isLoading={isSubmitting} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar tarea">
        {editing && (
          <TaskForm
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
        title="Eliminar tarea"
        description={`¿Querés eliminar "${deleting?.title}"?`}
      />
    </div>
  )
}
