import * as z from "zod"

export const PasswordPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  iconId: z.string().nullish(),
  isPinned: z.boolean(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullish(),
  snapshotOfPasswordId: z.string().nullish(),
  sharedCount: z.number().int(),
  isAutofillEnabled: z.boolean(),
  categoryId: z.string().nullish(),
  data_e: z.string(),
  note_e: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
