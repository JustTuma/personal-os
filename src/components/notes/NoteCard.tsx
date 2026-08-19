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
  const isPinned = !!note.is_pinned
  const accent = isPinned ? '#f472b6' : '#7c3aed'

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '170px',
        padding: '18px 20px',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isPinned ? 'rgba(244,114,182,0.3)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'border-color 200ms, box-shadow 200ms, transform 200ms',
        gap: '14px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isPinned ? 'rgba(244,114,182,0.6)' : 'rgba(124,58,237,0.4)'
        e.currentTarget.style.boxShadow = `0 0 20px ${isPinned ? 'rgba(244,114,182,0.15)' : 'rgba(124,58,237,0.12)'}, 0 8px 24px rgba(0,0,0,0.4)`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isPinned ? 'rgba(244,114,182,0.3)' : 'rgba(255,255,255,0.07)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Top accent line if pinned */}
      {isPinned && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #f472b6, #ec4899)',
        }} />
      )}

      {/* Ambient corner glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: '80px', height: '80px',
        borderRadius: '50%', background: accent, opacity: 0.05, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#eeeeff',
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>
            {note.title}
          </h3>

          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            <button
              onClick={() => onTogglePin(note.id, isPinned)}
              style={{
                padding: '6px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: isPinned ? 'rgba(244,114,182,0.15)' : 'transparent',
                color: isPinned ? '#f472b6' : '#55556a',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => {
                if (!isPinned) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.color = '#c8c8e8'
                }
              }}
              onMouseLeave={e => {
                if (!isPinned) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#55556a'
                }
              }}
              title={isPinned ? 'Desfijar' : 'Fijar'}
            >
              <Pin size={13} style={{ transform: isPinned ? 'rotate(45deg)' : 'none', transition: 'transform 150ms' }} />
            </button>
            <button
              onClick={() => onEdit(note)}
              style={{
                padding: '6px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#55556a',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.color = '#c8c8e8'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#55556a'
              }}
              title="Editar"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(note)}
              style={{
                padding: '6px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#55556a',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'
                e.currentTarget.style.color = '#f87171'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#55556a'
              }}
              title="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Snippet */}
        {note.content ? (
          <p style={{
            fontSize: '12.5px',
            color: '#9898b8',
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
          <p style={{ fontSize: '12px', color: '#55556a', margin: '10px 0 0', fontStyle: 'italic' }}>
            Sin contenido adicional...
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '10px',
        fontSize: '11.5px',
        color: '#55556a',
      }}>
        {note.project ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: note.project.color || '#a78bfa',
            backgroundColor: `${note.project.color || '#a78bfa'}15`,
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 500,
          }}>
            <Folder size={11} />
            {note.project.name}
          </span>
        ) : (
          <span style={{ color: '#55556a' }}>General</span>
        )}

        <span>{formatDateRelative(note.updated_at || note.created_at)}</span>
      </div>
    </div>
  )
}
