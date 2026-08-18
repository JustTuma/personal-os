import { z } from 'zod'

export const noteSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  content: z.string().default(''),
  project_id: z.string().uuid().optional().nullable(),
  is_pinned: z.boolean().default(false),
})

export type NoteFormValues = z.infer<typeof noteSchema>
