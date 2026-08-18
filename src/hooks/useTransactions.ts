'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { TransactionWithRelations, TransferWithRelations } from '@/types'
import type { TransactionFormValues, TransferFormValues } from '@/lib/validations/transaction'

interface FetchOptions {
  from?: string
  to?: string
  type?: 'income' | 'expense'
  accountId?: string
  limit?: number
}

async function fetchTransactions(options: FetchOptions = {}): Promise<TransactionWithRelations[]> {
  const supabase = createClient()

  let query = supabase
    .from('transactions')
    .select(`
      *,
      account:accounts(id, name, color, currency),
      category:categories(id, name, color, icon)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (options.from) query = query.gte('date', options.from)
  if (options.to)   query = query.lte('date', options.to)
  if (options.type) query = query.eq('type', options.type)
  if (options.accountId) query = query.eq('account_id', options.accountId)
  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as TransactionWithRelations[]
}

async function fetchTransfers(options: FetchOptions = {}): Promise<TransferWithRelations[]> {
  const supabase = createClient()

  let query = supabase
    .from('transfers')
    .select(`
      *,
      from_account:accounts!transfers_from_account_id_fkey(id, name, color),
      to_account:accounts!transfers_to_account_id_fkey(id, name, color)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (options.from) query = query.gte('date', options.from)
  if (options.to)   query = query.lte('date', options.to)
  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as TransferWithRelations[]
}

export function useTransactions(options: FetchOptions = {}) {
  const key = ['transactions', JSON.stringify(options)]

  const { data, error, isLoading } = useSWR(key, () => fetchTransactions(options), {
    revalidateOnFocus: false,
  })

  async function createTransaction(values: TransactionFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    // Get account currency
    const { data: account } = await supabase
      .from('accounts')
      .select('currency')
      .eq('id', values.account_id)
      .single()

    const { error } = await supabase.from('transactions').insert({
      ...values,
      user_id: user.id,
      currency: account?.currency ?? 'ARS',
    })

    if (error) {
      toast.error('Error al registrar la transacción')
      throw error
    }

    const label = values.type === 'income' ? 'Ingreso registrado' : 'Gasto registrado'
    toast.success(label)
    globalMutate(k => Array.isArray(k) && k[0] === 'transactions')
    globalMutate('accounts') // update balances
  }

  async function updateTransaction(id: string, values: Partial<TransactionFormValues>) {
    const supabase = createClient()
    const { error } = await supabase.from('transactions').update(values).eq('id', id)

    if (error) {
      toast.error('Error al actualizar')
      throw error
    }

    toast.success('Transacción actualizada')
    globalMutate(k => Array.isArray(k) && k[0] === 'transactions')
    globalMutate('accounts')
  }

  async function deleteTransaction(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar')
      throw error
    }

    toast.success('Transacción eliminada')
    globalMutate(k => Array.isArray(k) && k[0] === 'transactions')
    globalMutate('accounts')
  }

  return {
    transactions: data ?? [],
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}

export function useTransfers(options: FetchOptions = {}) {
  const key = ['transfers', JSON.stringify(options)]

  const { data, error, isLoading } = useSWR(key, () => fetchTransfers(options), {
    revalidateOnFocus: false,
  })

  async function createTransfer(values: TransferFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    // Get source account currency
    const { data: fromAccount } = await supabase
      .from('accounts')
      .select('currency')
      .eq('id', values.from_account_id)
      .single()

    const { error } = await supabase.from('transfers').insert({
      ...values,
      user_id: user.id,
      currency: fromAccount?.currency ?? 'ARS',
    })

    if (error) {
      toast.error('Error al registrar la transferencia')
      throw error
    }

    toast.success('Transferencia registrada')
    globalMutate(k => Array.isArray(k) && k[0] === 'transfers')
    globalMutate('accounts')
  }

  async function deleteTransfer(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('transfers').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar la transferencia')
      throw error
    }

    toast.success('Transferencia eliminada')
    globalMutate(k => Array.isArray(k) && k[0] === 'transfers')
    globalMutate('accounts')
  }

  return {
    transfers: data ?? [],
    isLoading,
    error,
    createTransfer,
    deleteTransfer,
  }
}
