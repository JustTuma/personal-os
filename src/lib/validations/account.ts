import { z } from 'zod'

export const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  type: z.enum(['cash', 'bank', 'digital_wallet', 'savings', 'investment', 'other']),
  currency: z.enum(['ARS', 'USD']),
  initial_balance: z.coerce.number({ invalid_type_error: 'Ingresá un número válido' }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido').default('#6366f1'),
  notes: z.string().max(500).nullable().optional(),
})

export type AccountFormValues = z.infer<typeof accountSchema>
