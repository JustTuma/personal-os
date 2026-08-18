import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  account_id: z.string().uuid('Seleccioná una cuenta'),
  category_id: z.string().uuid().optional().nullable(),
  amount: z.coerce
    .number({ invalid_type_error: 'Ingresá un monto válido' })
    .positive('El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripción es requerida').max(200),
  notes: z.string().max(500).optional().nullable(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export const transferSchema = z.object({
  from_account_id: z.string().uuid('Seleccioná la cuenta de origen'),
  to_account_id: z.string().uuid('Seleccioná la cuenta de destino'),
  amount: z.coerce
    .number({ invalid_type_error: 'Ingresá un monto válido' })
    .positive('El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().max(200).optional().nullable(),
}).refine(data => data.from_account_id !== data.to_account_id, {
  message: 'Las cuentas de origen y destino deben ser diferentes',
  path: ['to_account_id'],
})

export type TransferFormValues = z.infer<typeof transferSchema>
