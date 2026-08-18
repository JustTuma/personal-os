'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionFormValues } from '@/lib/validations/transaction'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { toDateInputValue } from '@/lib/utils/date'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TransactionFormProps {
  defaultType?: 'income' | 'expense'
  onSubmit: (values: TransactionFormValues) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<TransactionFormValues>
}

export function TransactionForm({ defaultType = 'expense', onSubmit, onCancel, defaultValues }: TransactionFormProps) {
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as never,
    defaultValues: {
      type: defaultType,
      date: toDateInputValue(),
      ...defaultValues,
    },
  })

  const type = watch('type')
  const filteredCategories = categories.filter(c => c.type === type || c.type === 'both')

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Type toggle */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '4px',
        backgroundColor: '#111117',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
      }}>
        <button
          type="button"
          onClick={() => setValue('type', 'expense')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '7px',
            fontSize: '13.5px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: type === 'expense' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            color: type === 'expense' ? '#f87171' : '#a0a0b0',
            transition: 'all 120ms',
          }}
        >
          <TrendingDown size={15} />
          <span>Gasto</span>
        </button>
        <button
          type="button"
          onClick={() => setValue('type', 'income')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '7px',
            fontSize: '13.5px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: type === 'income' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
            color: type === 'income' ? '#4ade80' : '#a0a0b0',
            transition: 'all 120ms',
          }}
        >
          <TrendingUp size={15} />
          <span>Ingreso</span>
        </button>
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
        label="Descripción"
        type="text"
        placeholder={type === 'income' ? 'Ej: Sueldo, Venta freelance' : 'Ej: Supermercado, Alquiler'}
        error={errors.description?.message}
        {...register('description')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Select
          label="Cuenta"
          placeholder="Seleccioná una cuenta"
          error={errors.account_id?.message}
          options={accounts.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
          {...register('account_id')}
        />
        <Select
          label="Categoría"
          placeholder="Sin categoría"
          options={filteredCategories.map(c => ({ value: c.id, label: c.name }))}
          {...register('category_id')}
        />
      </div>

      <Input
        label="Notas (opcional)"
        type="text"
        placeholder="Detalles adicionales..."
        {...register('notes')}
      />

      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <Button type="button" variant="ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          style={{
            flex: 1,
            backgroundColor: type === 'income' ? '#16a34a' : '#6366f1',
          }}
        >
          {type === 'income' ? 'Registrar ingreso' : 'Registrar gasto'}
        </Button>
      </div>
    </form>
  )
}
