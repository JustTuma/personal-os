'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { SubscriptionWithRelations } from '@/types'
import type { SubscriptionFormValues } from '@/lib/validations/subscription'
import { addMonths, addYears, addWeeks, addDays, format } from 'date-fns'

async function fetchSubscriptions(): Promise<SubscriptionWithRelations[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      account:accounts(id, name, color, currency),
      category:categories(id, name, color, icon)
    `)
    .order('next_payment_date', { ascending: true })

  if (error) throw error
  return data as unknown as SubscriptionWithRelations[]
}

export function useSubscriptions() {
  const { data, error, isLoading } = useSWR('subscriptions', fetchSubscriptions, {
    revalidateOnFocus: false,
  })

  async function createSubscription(values: SubscriptionFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase.from('subscriptions').insert({
      ...values,
      user_id: user.id,
      account_id: values.account_id || null,
      category_id: values.category_id || null,
    })

    if (error) {
      toast.error('Error al crear la suscripción')
      throw error
    }

    toast.success('Suscripción registrada')
    globalMutate('subscriptions')
  }

  async function updateSubscription(id: string, values: Partial<SubscriptionFormValues>) {
    const supabase = createClient()
    const { error } = await supabase.from('subscriptions').update({
      ...values,
      account_id: values.account_id || null,
      category_id: values.category_id || null,
    }).eq('id', id)

    if (error) {
      toast.error('Error al actualizar la suscripción')
      throw error
    }

    toast.success('Suscripción actualizada')
    globalMutate('subscriptions')
  }

  async function deleteSubscription(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('subscriptions').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar la suscripción')
      throw error
    }

    toast.success('Suscripción eliminada')
    globalMutate('subscriptions')
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      toast.error('Error al cambiar el estado')
      throw error
    }

    toast.success(!currentStatus ? 'Suscripción activada' : 'Suscripción pausada')
    globalMutate('subscriptions')
  }

  async function registerPayment(sub: SubscriptionWithRelations) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    if (!sub.account_id) {
      toast.error('La suscripción debe tener una cuenta asociada para registrar el pago')
      return
    }

    // 1. Create transaction
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      account_id: sub.account_id,
      category_id: sub.category_id,
      subscription_id: sub.id,
      type: 'expense',
      amount: sub.amount,
      currency: sub.currency,
      date: sub.next_payment_date,
      description: `Pago suscripción: ${sub.name}`,
    })

    if (txError) {
      toast.error('Error al registrar el pago')
      throw txError
    }

    // 2. Advance next_payment_date
    const currDate = new Date(sub.next_payment_date + 'T00:00:00')
    let nextDate = currDate
    if (sub.frequency === 'monthly') nextDate = addMonths(currDate, 1)
    else if (sub.frequency === 'annual') nextDate = addYears(currDate, 1)
    else if (sub.frequency === 'weekly') nextDate = addWeeks(currDate, 1)
    else if (sub.frequency === 'custom' && sub.custom_days) nextDate = addDays(currDate, sub.custom_days)
    else nextDate = addMonths(currDate, 1)

    const nextDateStr = format(nextDate, 'yyyy-MM-dd')

    const { error: subError } = await supabase
      .from('subscriptions')
      .update({ next_payment_date: nextDateStr })
      .eq('id', sub.id)

    if (subError) {
      toast.error('Gasto registrado, pero error al actualizar el próximo vencimiento')
      throw subError
    }

    toast.success(`Pago registrado. Próximo cobro: ${nextDateStr}`)
    globalMutate('subscriptions')
    globalMutate('accounts')
    globalMutate(k => Array.isArray(k) && k[0] === 'transactions')
  }

  return {
    subscriptions: data ?? [],
    isLoading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
    registerPayment,
  }
}
