'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { TaskWithRelations, TaskStatus } from '@/types'
import type { TaskFormValues } from '@/lib/validations/task'

async function fetchTasks(): Promise<TaskWithRelations[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, name, color)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as TaskWithRelations[]
}

export function useTasks() {
  const { data, error, isLoading } = useSWR('tasks', fetchTasks, {
    revalidateOnFocus: false,
  })

  async function createTask(values: TaskFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase.from('tasks').insert({
      ...values,
      user_id: user.id,
      project_id: values.project_id || null,
      due_date: values.due_date || null,
      description: values.description || null,
    })

    if (error) {
      toast.error('Error al crear la tarea')
      throw error
    }

    toast.success('Tarea agregada')
    globalMutate('tasks')
  }

  async function updateTask(id: string, values: Partial<TaskFormValues>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('tasks')
      .update({
        ...values,
        project_id: values.project_id || null,
        due_date: values.due_date || null,
        description: values.description || null,
      })
      .eq('id', id)

    if (error) {
      toast.error('Error al actualizar la tarea')
      throw error
    }

    toast.success('Tarea actualizada')
    globalMutate('tasks')
  }

  async function deleteTask(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar la tarea')
      throw error
    }

    toast.success('Tarea eliminada')
    globalMutate('tasks')
  }

  async function toggleTask(task: TaskWithRelations) {
    const supabase = createClient()
    const isCompleted = task.status === 'completed'
    const newStatus: TaskStatus = isCompleted ? 'todo' : 'completed'
    const completed_at = isCompleted ? null : new Date().toISOString()

    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at,
      })
      .eq('id', task.id)

    if (error) {
      toast.error('Error al cambiar estado')
      throw error
    }

    toast.success(isCompleted ? 'Tarea marcada como pendiente' : '🎉 ¡Tarea completada!')
    globalMutate('tasks')
  }

  return {
    tasks: data ?? [],
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  }
}
