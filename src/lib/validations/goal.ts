import { z } from 'zod'

export const goalSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional().nullable(),
  target_amount: z.coerce.number({ invalid_type_error: 'Ingresá un monto válido' }).positive('La meta debe ser mayor a 0'),
  current_amount: z.coerce.number({ invalid_type_error: 'Ingresá un monto válido' }).min(0, 'No puede ser negativo').default(0),
  currency: z.enum(['ARS', 'USD']),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida').optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido').default('#6366f1'),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).default('active'),
})

export const contributionSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: 'Ingresá un monto válido' }).refine(v => v !== 0, 'El aporte no puede ser 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  notes: z.string().max(500).optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
})

export type GoalFormValues = z.infer<typeof goalSchema>
export type ContributionFormValues = z.infer<typeof contributionSchema>
