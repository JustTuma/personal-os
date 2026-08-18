'use client'

import { Pin, Pencil, Trash2, Folder } from 'lucide-react'
import type { NoteWithRelations } from '@/types'
import { formatDateRelative } from '@/lib/utils/date'

interface NoteCardProps {
  note: NoteWithRelations
  onEdit: (note: NoteWithRelations) => void
  onDelete: (note: NoteWithRelations) => void
  onTogglePin: (id: string, currentPin: boolean) => void
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#111117',
        border: `1px solid ${note.is_pinned ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px',
        gap: '14px',
        transition: 'all 150ms',
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#f2f2f8',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {note.title}
          </h3>

          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={() => onTogglePin(note.id, !!note.is_pinned)}
              style={{
                padding: '5px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: note.is_pinned ? '#818cf8' : '#646473',
                cursor: 'pointer',
              }}
              title={note.is_pinned ? 'Desfijar' : 'Fijar'}
            >
              <Pin size={14} />
            </button>
            <button
              onClick={() => onEdit(note)}
              style={{
                padding: '5px',
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
              onClick={() => onDelete(note)}
              style={{
                padding: '5px',
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

        {/* Snippet */}
        {note.content ? (
          <p style={{
            fontSize: '13px',
            color: '#a0a0b0',
            margin: '10px 0 0',
            lineHeight: 1.5,
            whiteSpace: 'pre-line',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {note.content}
          </p>
        ) : (
          <p style={{ fontSize: '12.5px', color: '#646473', margin: '10px 0 0', fontStyle: 'italic' }}>
            Sin contenido adicional...
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        paddingTop: '10px',
        fontSize: '11.5px',
        color: '#646473',
      }}>
        {note.project ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: note.project.color || '#a0a0b0',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}>
            <Folder size={11} />
            {note.project.name}
          </span>
        ) : (
          <span style={{ color: '#646473' }}>Nota general</span>
        )}

        <span>{formatDateRelative(note.updated_at || note.created_at)}</span>
      </div>
    </div>
  )
}
