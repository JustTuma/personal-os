'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Account, AccountWithBalance } from '@/types'
import type { AccountFormValues } from '@/lib/validations/account'

async function fetchAccountsWithBalance(): Promise<AccountWithBalance[]> {
  const supabase = createClient()

  // Get accounts
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error

  // For each account, calculate current balance from transactions + transfers
  const withBalances = await Promise.all(
    accounts.map(async (account) => {
      const { data: incomeData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('account_id', account.id)
        .eq('type', 'income')

      const { data: expenseData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('account_id', account.id)
        .eq('type', 'expense')

      const { data: transfersIn } = await supabase
        .from('transfers')
        .select('amount')
        .eq('to_account_id', account.id)

      const { data: transfersOut } = await supabase
        .from('transfers')
        .select('amount')
        .eq('from_account_id', account.id)

      const income = (incomeData ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const expenses = (expenseData ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const inbound = (transfersIn ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const outbound = (transfersOut ?? []).reduce((s, r) => s + Number(r.amount), 0)

      return {
        ...account,
        current_balance: Number(account.initial_balance) + income - expenses + inbound - outbound,
      } as AccountWithBalance
    })
  )

  return withBalances
}

export function useAccounts() {
  const { data, error, isLoading } = useSWR('accounts', fetchAccountsWithBalance, {
    revalidateOnFocus: false,
  })

  async function createAccount(values: AccountFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase.from('accounts').insert({
      ...values,
      user_id: user.id,
    })

    if (error) {
      toast.error('Error al crear la cuenta')
      throw error
    }

    toast.success('Cuenta creada')
    globalMutate('accounts')
  }

  async function updateAccount(id: string, values: Partial<AccountFormValues>) {
    const supabase = createClient()
    const { error } = await supabase.from('accounts').update(values).eq('id', id)

    if (error) {
      toast.error('Error al actualizar la cuenta')
      throw error
    }

    toast.success('Cuenta actualizada')
    globalMutate('accounts')
  }

  async function deleteAccount(id: string) {
    const supabase = createClient()
    // Soft delete — mark as inactive
    const { error } = await supabase.from('accounts').update({ is_active: false }).eq('id', id)

    if (error) {
      toast.error('Error al eliminar la cuenta')
      throw error
    }

    toast.success('Cuenta eliminada')
    globalMutate('accounts')
  }

  return {
    accounts: data ?? [],
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
  }
}
