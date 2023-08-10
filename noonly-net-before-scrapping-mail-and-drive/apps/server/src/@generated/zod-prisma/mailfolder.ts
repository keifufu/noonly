import * as z from "zod"

export const MailFolderPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  position: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
