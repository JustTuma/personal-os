'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contributionSchema, type ContributionFormValues } from '@/lib/validations/goal'
import { useAccounts } from '@/hooks/useAccounts'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { toDateInputValue } from '@/lib/utils/date'
import type { GoalWithContributions } from '@/hooks/useFinancialGoals'

interface GoalContributionModalProps {
  goal: GoalWithContributions | null
  onClose: () => void
  onSubmit: (goal: GoalWithContributions, values: ContributionFormValues) => Promise<void>
}

export function GoalContributionModal({ goal, onClose, onSubmit }: GoalContributionModalProps) {
  const { accounts } = useAccounts()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema) as never,
    defaultValues: {
      date: toDateInputValue(),
    },
  })

  if (!goal) return null

  // Matching currency accounts
  const matchingAccounts = accounts.filter(a => a.currency === goal.currency)

  async function handleFormSubmit(values: ContributionFormValues) {
    if (!goal) return
    await onSubmit(goal, values)
    onClose()
  }

  return (
    <Modal
      isOpen={!!goal}
      onClose={onClose}
      title={`Sumar aporte a "${goal.name}"`}
      description={`Meta: ${goal.currency} ${goal.target_amount.toLocaleString()}`}
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit as never)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Monto a aportar"
          type="number"
          step="0.01"
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

        <Select
          label="Descontar de cuenta (opcional)"
          placeholder="No registrar gasto en cuenta"
          hint="Si seleccionás una cuenta, se creará un movimiento de gasto automáticamente"
          options={matchingAccounts.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))}
          error={errors.account_id?.message}
          {...register('account_id')}
        />

        <Input
          label="Nota o detalle (opcional)"
          placeholder="Ej: Ahorro del sueldo de agosto"
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} style={{ flex: 1 }}>
            Registrar aporte
          </Button>
        </div>
      </form>
    </Modal>
  )
}
