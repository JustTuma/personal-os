import { z } from 'zod'

export const subscriptionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  amount: z.coerce.number({ invalid_type_error: 'Ingresá un monto válido' }).positive('El monto debe ser mayor a 0'),
  currency: z.enum(['ARS', 'USD']),
  frequency: z.enum(['monthly', 'annual', 'weekly', 'custom']),
  custom_days: z.coerce.number().optional().nullable(),
  next_payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  account_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  is_active: z.boolean().default(true),
})

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>
