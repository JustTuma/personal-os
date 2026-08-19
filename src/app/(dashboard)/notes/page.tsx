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
  const { notes, isLoading, createNote, updateNote, deleteNote, togglePin } = useNotes()
  const { projects } = useProjects()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<NoteWithRelations | null>(null)
  const [deleting, setDeleting] = useState<NoteWithRelations | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (selectedProject !== 'all' && n.project_id !== selectedProject) return false
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
      if (editing) { await updateNote(editing.id, values); setEditing(null) }
      else { await createNote(values); setShowModal(false) }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setIsDeleting(true)
    try { await deleteNote(deleting.id); setDeleting(null) }
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
            backgroundColor: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.25)',
            marginBottom: '10px',
          }}>
            <FileText size={11} color="#f472b6" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#f472b6', letterSpacing: '0.04em' }}>Ideas & notas</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#eeeeff', margin: 0, letterSpacing: '-0.03em' }}>Notas e Ideas</h1>
          <p style={{ fontSize: '13.5px', color: '#7070a0', margin: '6px 0 0' }}>
            {notes.length} nota{notes.length !== 1 ? 's' : ''} guardada{notes.length !== 1 ? 's' : ''}
            {pinnedNotes.length > 0 && ` · ${pinnedNotes.length} fijada${pinnedNotes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button leftIcon={<Plus size={15} color="white" />} onClick={() => { setEditing(null); setShowModal(true) }}>
          Nueva nota
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} color="#55556a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar notas o ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', height: '36px', paddingLeft: '34px', paddingRight: '12px',
              borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-medium)', color: '#eeeeff', fontSize: '13px', outline: 'none',
            }}
          />
        </div>

        {projects.length > 0 && (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              height: '36px', padding: '0 14px', borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-medium)',
              color: '#9898b8', fontSize: '13px', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="all">Todos los proyectos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="glass-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <EmptyState
            icon={FileText}
            title={search ? 'No se encontraron notas' : 'No tenés notas todavía'}
            description={search ? 'Probá con otra palabra clave.' : 'Escribí tus ideas, notas rápidas de reuniones o recordatorios importantes.'}
            actionLabel={!search ? 'Crear primera nota' : undefined}
            onAction={!search ? () => setShowModal(true) : undefined}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Pinned notes */}
          {pinnedNotes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Pin size={13} color="#f472b6" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Notas fijadas
                </span>
              </div>
              <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {pinnedNotes.map((note, i) => (
                  <div key={note.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <NoteCard note={note} onEdit={setEditing} onDelete={setDeleting} onTogglePin={togglePin} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular notes */}
          {unpinnedNotes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pinnedNotes.length > 0 && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Otras notas
                </span>
              )}
              <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {unpinnedNotes.map((note, i) => (
                  <div key={note.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <NoteCard note={note} onEdit={setEditing} onDelete={setDeleting} onTogglePin={togglePin} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <NoteModal
        isOpen={showModal || !!editing}
        onClose={() => { setShowModal(false); setEditing(null) }}
        onSubmit={handleCreateOrUpdate}
        initialData={editing}
        isLoading={isSubmitting}
      />
      <ConfirmDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Eliminar nota" description={`¿Querés eliminar la nota "${deleting?.title}"?`} />
    </div>
  )
}
