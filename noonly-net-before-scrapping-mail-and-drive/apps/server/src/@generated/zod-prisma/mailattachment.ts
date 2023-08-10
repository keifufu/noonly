import * as z from "zod"

export const MailAttachmentPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  mailId: z.string(),
  r2_key: z.string(),
})
