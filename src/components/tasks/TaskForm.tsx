'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormValues } from '@/lib/validations/task'
import { useProjects } from '@/hooks/useProjects'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { toDateInputValue } from '@/lib/utils/date'

interface TaskFormProps {
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<TaskFormValues>
  isLoading?: boolean
}

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high',   label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

export function TaskForm({ onSubmit, onCancel, defaultValues, isLoading }: TaskFormProps) {
  const { projects } = useProjects()

  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as never,
    defaultValues: {
      priority: 'medium',
      status: 'todo',
      ...defaultValues,
      description: defaultValues?.description ?? undefined,
      due_date: defaultValues?.due_date ?? undefined,
      project_id: defaultValues?.project_id ?? undefined,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="Título de la tarea"
        placeholder="Ej: Terminar presentación, Pagar impuestos, Llamar al contador"
        error={errors.title?.message}
        {...register('title')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select
          label="Prioridad"
          options={PRIORITY_OPTIONS}
          error={errors.priority?.message}
          {...register('priority')}
        />
        <Input
          label="Fecha límite (opcional)"
          type="date"
          error={errors.due_date?.message}
          {...register('due_date')}
        />
      </div>

      <Select
        label="Proyecto asociado (opcional)"
        placeholder="Sin proyecto"
        options={projects.map(p => ({ value: p.id, label: p.name }))}
        error={errors.project_id?.message}
        {...register('project_id')}
      />

      <Input
        label="Detalles o notas (opcional)"
        placeholder="Descripción adicional, pasos necesarios..."
        {...register('description')}
      />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
          {defaultValues ? 'Guardar cambios' : 'Crear tarea'}
        </Button>
      </div>
    </form>
  )
}
