'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { subscriptionSchema, type SubscriptionFormValues } from '@/lib/validations/subscription'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { toDateInputValue } from '@/lib/utils/date'

interface SubscriptionFormProps {
  onSubmit: (values: SubscriptionFormValues) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<SubscriptionFormValues>
  isLoading?: boolean
}

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'annual',  label: 'Anual' },
  { value: 'weekly',  label: 'Semanal' },
  { value: 'custom',  label: 'Personalizada (días)' },
]

export function SubscriptionForm({ onSubmit, onCancel, defaultValues, isLoading }: SubscriptionFormProps) {
  const { accounts } = useAccounts()
  const { categories } = useCategories('expense')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema) as never,
    defaultValues: {
      currency: 'ARS',
      frequency: 'monthly',
      next_payment_date: toDateInputValue(),
      is_active: true,
      ...defaultValues,
      account_id: defaultValues?.account_id ?? undefined,
      category_id: defaultValues?.category_id ?? undefined,
      notes: defaultValues?.notes ?? undefined,
    },
  })

  const frequency = watch('frequency')

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input
        label="Nombre del servicio"
        placeholder="Ej: Netflix, Spotify, AWS, Gimnasio"
        error={errors.name?.message}
        {...register('name')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
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

      <div style={{ display: 'grid', gridTemplateColumns: frequency === 'custom' ? '1fr 1fr' : '1fr 1fr', gap: '12px' }}>
        <Select
          label="Frecuencia"
          options={FREQUENCY_OPTIONS}
          error={errors.frequency?.message}
          {...register('frequency')}
        />
        {frequency === 'custom' ? (
          <Input
            label="Cada cuántos días"
            type="number"
            placeholder="Ej: 45"
            error={errors.custom_days?.message}
            {...register('custom_days')}
          />
        ) : (
          <Input
            label="Próximo cobro"
            type="date"
            error={errors.next_payment_date?.message}
            {...register('next_payment_date')}
          />
        )}
      </div>

      {frequency === 'custom' && (
        <Input
          label="Próximo cobro"
          type="date"
          error={errors.next_payment_date?.message}
          {...register('next_payment_date')}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select
          label="Cuenta de cobro (opcional)"
          placeholder="Sin vincular"
          options={accounts.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
          error={errors.account_id?.message}
          {...register('account_id')}
        />
        <Select
          label="Categoría"
          placeholder="Sin categoría"
          options={categories.map(c => ({ value: c.id, label: c.name }))}
          error={errors.category_id?.message}
          {...register('category_id')}
        />
      </div>

      <Input
        label="Notas o detalles"
        placeholder="Plan familiar, facturación automática..."
        {...register('notes')}
      />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
          {defaultValues ? 'Guardar cambios' : 'Crear suscripción'}
        </Button>
      </div>
    </form>
  )
}
