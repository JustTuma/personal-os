'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { noteSchema, type NoteFormValues } from '@/lib/validations/note'
import { useProjects } from '@/hooks/useProjects'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Pin } from 'lucide-react'
import type { NoteWithRelations } from '@/types'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: NoteFormValues) => Promise<void>
  initialData?: NoteWithRelations | null
  isLoading?: boolean
}

export function NoteModal({ isOpen, onClose, onSubmit, initialData, isLoading }: NoteModalProps) {
  const { projects } = useProjects()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema) as never,
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      is_pinned: initialData?.is_pinned || false,
      project_id: initialData?.project_id || undefined,
    },
  })

  const isPinned = watch('is_pinned')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar nota' : 'Nueva nota / idea'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Título"
              placeholder="Ej: Idea de negocio, Notas de reunión, Links útiles"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>
          <button
            type="button"
            onClick={() => setValue('is_pinned', !isPinned)}
            style={{
              marginTop: '22px',
              height: '40px',
              padding: '0 12px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: isPinned ? 'rgba(99, 102, 241, 0.15)' : '#181820',
              color: isPinned ? '#818cf8' : '#646473',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 120ms',
            }}
          >
            <Pin size={15} />
            <span>{isPinned ? 'Fijada' : 'Fijar'}</span>
          </button>
        </div>

        <Select
          label="Proyecto asociado (opcional)"
          placeholder="Sin proyecto"
          options={projects.map(p => ({ value: p.id, label: p.name }))}
          error={errors.project_id?.message}
          {...register('project_id')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contenido
          </label>
          <textarea
            placeholder="Escribí tus ideas, notas en texto o markdown..."
            rows={8}
            style={{
              width: '100%',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '13.5px',
              backgroundColor: '#181820',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f2f2f8',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
            {...register('content')}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
            {initialData ? 'Guardar cambios' : 'Guardar nota'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
