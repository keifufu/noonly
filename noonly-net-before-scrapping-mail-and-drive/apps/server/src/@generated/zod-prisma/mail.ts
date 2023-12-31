import * as z from "zod"

export const MailPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  senderId: z.string(),
  messageId: z.string(),
  inReplyTo: z.string().nullish(),
  recipients: z.string(),
  cc: z.string().nullish(),
  bcc: z.string().nullish(),
  toAddressId: z.string(),
  subject: z.string(),
  customSubject: z.string().nullish(),
  html: z.string(),
  text: z.string(),
  previewText: z.string(),
  isRead: z.boolean(),
  isStarred: z.boolean(),
  isTrashed: z.boolean(),
  trashedAt: z.date().nullish(),
  mailFolderId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  newestReplyDate: z.date(),
})
