import * as z from "zod"

export const DriveFolderPrismaModel = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  parentFolderId: z.string().nullish(),
  size: z.number().int(),
  isDeleted: z.boolean(),
  deletedAt: z.date().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sharedCount: z.number().int(),
  hasLink: z.boolean(),
  linkId: z.string().nullish(),
})
