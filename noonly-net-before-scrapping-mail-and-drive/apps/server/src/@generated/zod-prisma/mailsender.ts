import * as z from "zod"

export const MailSenderPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string(),
  bundleMail: z.boolean(),
  pushNotifications: z.boolean(),
  isInScreener: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  mailFolderId: z.string(),
})
