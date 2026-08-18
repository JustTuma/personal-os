'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { FinancialGoal, GoalContribution, GoalStatus } from '@/types'
import type { GoalFormValues, ContributionFormValues } from '@/lib/validations/goal'

export interface GoalWithContributions extends FinancialGoal {
  contributions: GoalContribution[]
}

async function fetchGoals(): Promise<GoalWithContributions[]> {
  const supabase = createClient()

  const { data: goals, error: goalsError } = await supabase
    .from('financial_goals')
    .select('*')
    .order('created_at', { ascending: false })

  if (goalsError) throw goalsError

  const { data: contributions, error: contribError } = await supabase
    .from('goal_contributions')
    .select('*')
    .order('date', { ascending: false })

  if (contribError) throw contribError

  return (goals || []).map(goal => ({
    ...goal,
    contributions: (contributions || []).filter(c => c.goal_id === goal.id),
  }))
}

export function useFinancialGoals() {
  const { data, error, isLoading } = useSWR('financial_goals', fetchGoals, {
    revalidateOnFocus: false,
  })

  async function createGoal(values: GoalFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: newGoal, error } = await supabase
      .from('financial_goals')
      .insert({
        ...values,
        user_id: user.id,
        target_date: values.target_date || null,
        description: values.description || null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Error al crear el objetivo')
      throw error
    }

    // If initial amount > 0, record it as first contribution
    if (values.current_amount > 0 && newGoal) {
      await supabase.from('goal_contributions').insert({
        user_id: user.id,
        goal_id: newGoal.id,
        amount: values.current_amount,
        date: new Date().toISOString().split('T')[0],
        notes: 'Aporte inicial',
      })
    }

    toast.success('Objetivo financiero creado')
    globalMutate('financial_goals')
  }

  async function updateGoal(id: string, values: Partial<GoalFormValues>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('financial_goals')
      .update({
        ...values,
        target_date: values.target_date || null,
        description: values.description || null,
      })
      .eq('id', id)

    if (error) {
      toast.error('Error al actualizar el objetivo')
      throw error
    }

    toast.success('Objetivo actualizado')
    globalMutate('financial_goals')
  }

  async function deleteGoal(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('financial_goals').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar el objetivo')
      throw error
    }

    toast.success('Objetivo eliminado')
    globalMutate('financial_goals')
  }

  async function updateStatus(id: string, status: GoalStatus) {
    const supabase = createClient()
    const { error } = await supabase
      .from('financial_goals')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Error al actualizar estado')
      throw error
    }

    toast.success('Estado actualizado')
    globalMutate('financial_goals')
  }

  async function addContribution(goal: GoalWithContributions, values: ContributionFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    // 1. Insert contribution
    const { error: contribError } = await supabase.from('goal_contributions').insert({
      user_id: user.id,
      goal_id: goal.id,
      amount: values.amount,
      date: values.date,
      notes: values.notes || null,
    })

    if (contribError) {
      toast.error('Error al registrar aporte')
      throw contribError
    }

    // 2. Update current_amount on goal
    const newAmount = Number(goal.current_amount) + Number(values.amount)
    const isCompleted = newAmount >= goal.target_amount

    const { error: goalError } = await supabase
      .from('financial_goals')
      .update({
        current_amount: newAmount,
        status: isCompleted ? 'completed' : goal.status,
      })
      .eq('id', goal.id)

    if (goalError) {
      toast.error('Error al actualizar el acumulado del objetivo')
      throw goalError
    }

    // 3. If an account was selected, record expense transaction
    if (values.account_id) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        account_id: values.account_id,
        type: 'expense',
        amount: Math.abs(values.amount),
        currency: goal.currency,
        date: values.date,
        description: `Aporte a objetivo: ${goal.name}`,
      })
      globalMutate('accounts')
      globalMutate(k => Array.isArray(k) && k[0] === 'transactions')
    }

    if (isCompleted) {
      toast.success(`🎉 ¡Felicitaciones! Alcanzaste tu meta de "${goal.name}"`)
    } else {
      toast.success('Aporte registrado correctamente')
    }

    globalMutate('financial_goals')
  }

  return {
    goals: data ?? [],
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    updateStatus,
    addContribution,
  }
}
