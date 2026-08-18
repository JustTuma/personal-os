'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormValues } from '@/lib/validations/project'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface ProjectFormProps {
  onSubmit: (values: ProjectFormValues) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<ProjectFormValues>
  isLoading?: boolean
}

const STATUS_OPTIONS = [
  { value: 'idea',        label: 'Idea' },
  { value: 'planning',    label: 'Planificación' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'paused',      label: 'Pausado' },
  { value: 'completed',   label: 'Completado' },
  { value: 'cancelled',   label: 'Cancelado' },
]

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high',   label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
]

export function ProjectForm({ onSubmit, onCancel, defaultValues, isLoading }: ProjectFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as never,
    defaultValues: {
      status: 'in_progress',
      priority: 'medium',
      color: '#6366f1',
      ...defaultValues,
      description: defaultValues?.description ?? undefined,
      start_date: defaultValues?.start_date ?? undefined,
      target_date: defaultValues?.target_date ?? undefined,
    },
  })

  const selectedColor = watch('color') ?? '#6366f1'

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="Nombre del proyecto"
        placeholder="Ej: Rediseño web, Lanzamiento MVP, Mudanza"
        error={errors.name?.message}
        {...register('name')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select
          label="Estado"
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
        <Select
          label="Prioridad"
          options={PRIORITY_OPTIONS}
          error={errors.priority?.message}
          {...register('priority')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Input
          label="Fecha de inicio (opcional)"
          type="date"
          error={errors.start_date?.message}
          {...register('start_date')}
        />
        <Input
          label="Fecha de entrega / meta"
          type="date"
          error={errors.target_date?.message}
          {...register('target_date')}
        />
      </div>

      {/* Color picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Color de proyecto
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: color,
                border: selectedColor === color ? '2px solid white' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'transform 120ms',
                transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      <Input
        label="Descripción u objetivos (opcional)"
        placeholder="Alcance del proyecto, notas clave..."
        {...register('description')}
      />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
          {defaultValues ? 'Guardar cambios' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  )
}
