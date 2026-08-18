'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { NoteWithRelations } from '@/types'
import type { NoteFormValues } from '@/lib/validations/note'

async function fetchNotes(): Promise<NoteWithRelations[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      project:projects(id, name, color)
    `)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as NoteWithRelations[]
}

export function useNotes() {
  const { data, error, isLoading } = useSWR('notes', fetchNotes, {
    revalidateOnFocus: false,
  })

  async function createNote(values: NoteFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase.from('notes').insert({
      ...values,
      user_id: user.id,
      project_id: values.project_id || null,
      content: values.content || '',
    })

    if (error) {
      toast.error('Error al crear la nota')
      throw error
    }

    toast.success('Nota guardada')
    globalMutate('notes')
  }

  async function updateNote(id: string, values: Partial<NoteFormValues>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('notes')
      .update({
        ...values,
        project_id: values.project_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      toast.error('Error al actualizar la nota')
      throw error
    }

    toast.success('Nota actualizada')
    globalMutate('notes')
  }

  async function deleteNote(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar la nota')
      throw error
    }

    toast.success('Nota eliminada')
    globalMutate('notes')
  }

  async function togglePin(id: string, currentPin: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('notes')
      .update({ is_pinned: !currentPin })
      .eq('id', id)

    if (error) {
      toast.error('Error al fijar nota')
      throw error
    }

    globalMutate('notes')
  }

  return {
    notes: data ?? [],
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  }
}
