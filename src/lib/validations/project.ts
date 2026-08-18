import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['idea', 'planning', 'in_progress', 'paused', 'completed', 'cancelled']).default('in_progress'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido').default('#6366f1'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida').optional().nullable(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida').optional().nullable(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
