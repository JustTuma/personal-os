'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Project, Task, ProjectStatus } from '@/types'
import type { ProjectFormValues } from '@/lib/validations/project'

export interface ProjectWithStats extends Project {
  tasks: Task[]
  totalTasks: number
  completedTasks: number
  completionRate: number
}

async function fetchProjects(): Promise<ProjectWithStats[]> {
  const supabase = createClient()

  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (projError) throw projError

  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('*')

  if (taskError) throw taskError

  return (projects || []).map(p => {
    const projectTasks = (tasks || []).filter(t => t.project_id === p.id)
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length
    const totalTasks = projectTasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      ...p,
      tasks: projectTasks,
      totalTasks,
      completedTasks,
      completionRate,
    }
  })
}

export function useProjects() {
  const { data, error, isLoading } = useSWR('projects', fetchProjects, {
    revalidateOnFocus: false,
  })

  async function createProject(values: ProjectFormValues) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { error } = await supabase.from('projects').insert({
      ...values,
      user_id: user.id,
      start_date: values.start_date || null,
      due_date: values.target_date || null,
      description: values.description || null,
    })

    if (error) {
      toast.error('Error al crear el proyecto')
      throw error
    }

    toast.success('Proyecto creado')
    globalMutate('projects')
  }

  async function updateProject(id: string, values: Partial<ProjectFormValues>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('projects')
      .update({
        ...values,
        start_date: values.start_date || null,
        due_date: values.target_date || null,
        description: values.description || null,
      })
      .eq('id', id)

    if (error) {
      toast.error('Error al actualizar proyecto')
      throw error
    }

    toast.success('Proyecto actualizado')
    globalMutate('projects')
  }

  async function deleteProject(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar proyecto')
      throw error
    }

    toast.success('Proyecto eliminado')
    globalMutate('projects')
    globalMutate('tasks')
  }

  async function updateStatus(id: string, status: ProjectStatus) {
    const supabase = createClient()
    const completed_at = status === 'completed' ? new Date().toISOString() : null

    const { error } = await supabase
      .from('projects')
      .update({ status, completed_at })
      .eq('id', id)

    if (error) {
      toast.error('Error al actualizar estado')
      throw error
    }

    toast.success('Estado del proyecto actualizado')
    globalMutate('projects')
  }

  return {
    projects: data ?? [],
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    updateStatus,
  }
}
