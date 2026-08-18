'use client'

import { useState, useMemo } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { useProjects } from '@/hooks/useProjects'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteModal } from '@/components/notes/NoteModal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FileText, Plus, Search, Pin } from 'lucide-react'
import type { NoteWithRelations } from '@/types'
import type { NoteFormValues } from '@/lib/validations/note'

export default function NotesPage() {
  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  } = useNotes()

  const { projects } = useProjects()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<NoteWithRelations | null>(null)
  const [deleting, setDeleting] = useState<NoteWithRelations | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      // Project filter
      if (selectedProject !== 'all' && n.project_id !== selectedProject) return false

      // Search
      if (search) {
        const query = search.toLowerCase()
        const matchTitle = n.title.toLowerCase().includes(query)
        const matchContent = (n.content || '').toLowerCase().includes(query)
        if (!matchTitle && !matchContent) return false
      }

      return true
    })
  }, [notes, selectedProject, search])

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.is_pinned), [filteredNotes])
  const unpinnedNotes = useMemo(() => filteredNotes.filter(n => !n.is_pinned), [filteredNotes])

  async function handleCreateOrUpdate(values: NoteFormValues) {
    setIsSubmitting(true)
    try {
      if (editing) {
        await updateNote(editing.id, values)
        setEditing(null)
      } else {
        await createNote(values)
        setShowModal(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try {
      await deleteNote(deleting.id)
      setDeleting(null)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleEdit(note: NoteWithRelations) {
    setEditing(note)
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
            Notas e Ideas
          </h1>
          <p style={{ fontSize: '13.5px', color: '#a0a0b0', margin: '4px 0 0' }}>
            {notes.length} nota{notes.length !== 1 ? 's' : ''} guardada{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => { setEditing(null); setShowModal(true) }}>
          Nueva nota
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Project Selector */}
        {projects.length > 0 && (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              height: '36px',
              padding: '0 14px',
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

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder="Buscar notas o ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '34px',
              paddingRight: '12px',
              borderRadius: '8px',
              backgroundColor: '#181820',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f2f2f8',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <Search size={15} color="#646473" style={{ position: 'absolute', left: '11px', top: '10px' }} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{
          backgroundColor: '#111117',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <EmptyState
            icon={FileText}
            title={search ? 'No se encontraron notas' : 'No tenés notas todavía'}
            description={search ? 'Probá con otra palabra clave.' : 'Escribí tus ideas, notas rápidas de reuniones o recordatorios importantes.'}
            actionLabel={!search ? 'Crear primera nota' : undefined}
            onAction={!search ? () => setShowModal(true) : undefined}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Pinned notes */}
          {pinnedNotes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Pin size={13} />
                <span>Notas fijadas</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={setDeleting}
                    onTogglePin={togglePin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular notes */}
          {unpinnedNotes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pinnedNotes.length > 0 && (
                <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#646473', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Otras notas
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {unpinnedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={setDeleting}
                    onTogglePin={togglePin}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <NoteModal
        isOpen={showModal || !!editing}
        onClose={() => { setShowModal(false); setEditing(null) }}
        onSubmit={handleCreateOrUpdate}
        initialData={editing}
        isLoading={isSubmitting}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Eliminar nota"
        description={`¿Querés eliminar la nota "${deleting?.title}"?`}
      />
    </div>
  )
}
