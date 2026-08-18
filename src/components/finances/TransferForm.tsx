'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transferSchema, type TransferFormValues } from '@/lib/validations/transaction'
import { useAccounts } from '@/hooks/useAccounts'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { toDateInputValue } from '@/lib/utils/date'
import { ArrowRight } from 'lucide-react'

interface TransferFormProps {
  onSubmit: (values: TransferFormValues) => Promise<void>
  onCancel: () => void
}

export function TransferForm({ onSubmit, onCancel }: TransferFormProps) {
  const { accounts } = useAccounts()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema) as never,
    defaultValues: { date: toDateInputValue() },
  })

  const fromId = watch('from_account_id')
  const toOptions = accounts.filter(a => a.id !== fromId).map(a => ({
    value: a.id,
    label: `${a.name} (${a.currency})`,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        padding: '12px 14px',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '10px',
        fontSize: '12.5px',
        color: '#a5b4fc',
        lineHeight: 1.4,
      }}>
        💡 Una transferencia entre cuentas propias <strong>no cuenta como ingreso ni gasto</strong>, sólo mueve saldo.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select
          label="Cuenta origen"
          placeholder="Seleccioná origen"
          error={errors.from_account_id?.message}
          options={accounts.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
          {...register('from_account_id')}
        />
        <Select
          label="Cuenta destino"
          placeholder="Seleccioná destino"
          error={errors.to_account_id?.message}
          options={toOptions}
          {...register('to_account_id')}
        />
      </div>

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
        <Input
          label="Fecha"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      <Input
        label="Descripción (opcional)"
        type="text"
        placeholder="Ej: Retiro de efectivo, Envío a billetera"
        {...register('description')}
      />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} style={{ flex: 1 }}>
          Transferir
        </Button>
      </div>
    </form>
  )
}
