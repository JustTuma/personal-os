'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalSchema, type GoalFormValues } from '@/lib/validations/goal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface GoalFormProps {
  onSubmit: (values: GoalFormValues) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<GoalFormValues>
  isLoading?: boolean
}

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
]

const STATUS_OPTIONS = [
  { value: 'active',    label: 'Activo' },
  { value: 'completed', label: 'Completado' },
  { value: 'paused',    label: 'Pausado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function GoalForm({ onSubmit, onCancel, defaultValues, isLoading }: GoalFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema) as never,
    defaultValues: {
      currency: 'ARS',
      current_amount: 0,
      color: '#6366f1',
      status: 'active',
      ...defaultValues,
      description: defaultValues?.description ?? undefined,
      target_date: defaultValues?.target_date ?? undefined,
    },
  })

  const selectedColor = watch('color') ?? '#6366f1'

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="Nombre del objetivo"
        placeholder="Ej: Fondo de emergencia, Viaje a Europa, Auto nuevo"
        error={errors.name?.message}
        {...register('name')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Input
          label="Monto objetivo (Meta)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.target_amount?.message}
          {...register('target_amount')}
        />
        <Select
          label="Moneda"
          options={[
            { value: 'ARS', label: 'ARS — Pesos' },
            { value: 'USD', label: 'USD — Dólares' },
          ]}
          error={errors.currency?.message}
          {...register('currency')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Input
          label="Monto inicial ahorrado"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.current_amount?.message}
          {...register('current_amount')}
        />
        <Input
          label="Fecha estimada (opcional)"
          type="date"
          error={errors.target_date?.message}
          {...register('target_date')}
        />
      </div>

      {defaultValues && (
        <Select
          label="Estado"
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
      )}

      {/* Color picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Color identificador
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
        label="Descripción o notas (opcional)"
        placeholder="Para qué es este objetivo, detalles o plazos..."
        {...register('description')}
      />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
          {defaultValues ? 'Guardar cambios' : 'Crear objetivo'}
        </Button>
      </div>
    </form>
  )
}
