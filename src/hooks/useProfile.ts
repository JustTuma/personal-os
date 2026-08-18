'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile, Currency } from '@/types'

async function fetchProfile(): Promise<{ profile: Profile | null; email: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { profile: null, email: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    profile: profile || null,
    email: user.email || null,
  }
}

export function useProfile() {
  const { data, error, isLoading } = useSWR('user_profile', fetchProfile, {
    revalidateOnFocus: false,
  })

  async function updateProfile(values: { full_name?: string; currency_preference?: Currency }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase
      .from('profiles')
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Error al guardar el perfil')
      throw error
    }

    toast.success('Perfil actualizado')
    globalMutate('user_profile')
  }

  async function updatePassword(newPassword: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      toast.error(error.message || 'Error al cambiar contraseña')
      throw error
    }

    toast.success('Contraseña actualizada correctamente')
  }

  return {
    profile: data?.profile || null,
    email: data?.email || null,
    isLoading,
    error,
    updateProfile,
    updatePassword,
  }
}
