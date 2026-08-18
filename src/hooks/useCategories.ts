'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Category, CategoryType } from '@/types'

async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export function useCategories(type?: 'income' | 'expense' | 'both') {
  const { data, error, isLoading } = useSWR('categories', fetchCategories, {
    revalidateOnFocus: false,
  })

  async function createCategory(values: { name: string; type: CategoryType; color?: string; icon?: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: values.name,
      type: values.type,
      color: values.color || '#6366f1',
      icon: values.icon || null,
      is_default: false,
    })

    if (error) {
      toast.error('Error al crear categoría')
      throw error
    }

    toast.success('Categoría creada')
    globalMutate('categories')
  }

  async function deleteCategory(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar categoría')
      throw error
    }

    toast.success('Categoría eliminada')
    globalMutate('categories')
  }

  const filtered = type
    ? (data ?? []).filter(c => c.type === type || c.type === 'both')
    : (data ?? [])

  return {
    categories: filtered,
    allCategories: data ?? [],
    isLoading,
    error,
    createCategory,
    deleteCategory,
    refetch: () => globalMutate('categories'),
  }
}
